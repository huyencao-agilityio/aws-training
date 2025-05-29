import { App, Fn, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

import { COGNITO } from '@constants/cognito.constant';
import { ParameterKeys } from '@constants/parameter-keys.constant';
import { UserPoolConstruct } from '@constructs/cognito/user-pool.construct';
import { SecretHelper } from '@shared/secret.helper';

// Mock SecretHelper
jest.mock('@shared/secret.helper', () => ({
  SecretHelper: {
    getPlainTextParameter: jest.fn()
      .mockImplementation((scope, id, key) => {
        if (key === ParameterKeys.DefaultEmailAddress) {
          return 'test@example.com';
        }
        return '';
      })
  }
}));

describe('TestUserPoolConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get certificate from certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestFromCertificate',
      Fn.importValue('TestCertificate')
    );

    // Create user pool construct
    new UserPoolConstruct(stack, 'TestUserPoolConstruct', {
      region: 'us-east-1',
      domainName: 'auth.example.com',
      certificate,
    });

    template = Template.fromStack(stack);
  });

  describe('Basic Configuration', () => {
    it('should create a User Pool', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    it('should create user pool with correct name pattern', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: Match.stringLikeRegexp('^ecommerce-.*-dev$')
      });
    });

    it('should config email as the primary sign-in attribute', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email']
      });
    });

    it('should auto-verify email addresses', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AutoVerifiedAttributes: ['email']
      });
    });

    it('should disable MFA by default', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        MfaConfiguration: 'OFF'
      });
    });

    it('should config standard attributes for email and given name', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'email',
            Required: true,
            Mutable: true
          }),
          Match.objectLike({
            Name: 'given_name',
            Required: true,
            Mutable: true
          }),
        ])
      });
    });

    it('should enforce password policy correctly', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: 12,
            PasswordHistorySize: 2,
            RequireLowercase: true,
            RequireNumbers: true,
            RequireSymbols: true,
            RequireUppercase: true,
            TemporaryPasswordValidityDays: 7
          }
        }
      });
    });

    it('should custom user verification email settings correctly', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        VerificationMessageTemplate: {
          EmailSubjectByLink: COGNITO.EMAIL.SUBJECT,
          EmailMessageByLink: COGNITO.EMAIL.BODY,
          DefaultEmailOption: 'CONFIRM_WITH_LINK'
        }
      });
    });

    it('should config send email with SES', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        EmailConfiguration: {
          EmailSendingAccount: 'DEVELOPER'
        }
      });
    });

    it('should allow user auto sign up', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {
          AllowAdminCreateUserOnly: false
        },
      });
    });

    it('should get credentials for default email address', () => {
      expect(SecretHelper.getPlainTextParameter).toHaveBeenCalledWith(
        expect.any(Object),
        ParameterKeys.DefaultEmailAddress
      );
    });

    it('should apply removal policy DESTROY', () => {
      template.hasResource('AWS::Cognito::UserPool', {
        DeletionPolicy: 'Delete'
      });
    });
  });

  describe('UserPool Groups', () => {
    it('should create two groups', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolGroup', 2);
    });

    it('should create admin group with correct configuration', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: COGNITO.GROUPS.ADMIN.NAME,
        UserPoolId: {
          Ref: Match.stringLikeRegexp('.*TestUserPoolConstruct.*')
        },
        Description: COGNITO.GROUPS.ADMIN.DESCRIPTION
      });
    });

    it('should create user group with correct configuration', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: COGNITO.GROUPS.USER.NAME,
        UserPoolId: {
          Ref: Match.stringLikeRegexp('.*TestUserPoolConstruct.*')
        },
        Description: COGNITO.GROUPS.USER.DESCRIPTION
      });
    });
  });

  describe('UserPool add a custom domain', () => {
    it('should add a custom domain to the user pool', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        Domain: 'auth.example.com',
        CustomDomainConfig: {
          CertificateArn: {
            'Fn::ImportValue': Match.stringLikeRegexp('.*TestCertificate.*'),
          },
        },
      });
    });
  });

  describe('Config user attribute update settings', () => {
    it('should config user attribute settings correctly', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserAttributeUpdateSettings: {
          AttributesRequireVerificationBeforeUpdate: ['email'],
        },
      });
    });
  });

  describe('Cognito User Pool Client', () => {
    it('should create user pool client mapping with name', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ClientName: COGNITO.CLIENT_NAME,
      });
    });

    it('should set access and id token validity to 60 minutes', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AccessTokenValidity: 60,
        IdTokenValidity: 60,
      });
    });

    it('should set refresh token validity to 5 days', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        RefreshTokenValidity: 7200, // 5 days (120 hours * 60 minutes)
      });
    });

    it('should enable code and implicit grant flows', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlows: [
          'implicit',
          'code'
         ],
        AllowedOAuthFlowsUserPoolClient: true,
      });
    });

    it('should include correct OAuth scopes', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthScopes: [
          'aws.cognito.signin.user.admin',
          'email',
          'openid',
          'phone',
          'profile',
        ],
      });
    });

    it('should set correct callback and logout URLs', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        CallbackURLs: [COGNITO.REDIRECT_URI],
        LogoutURLs: [COGNITO.LOGOUT_URI],
      });
    });

    it('should enable custom, user, and SRP auth flows', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ExplicitAuthFlows: [
          "ALLOW_CUSTOM_AUTH",
          'ALLOW_USER_SRP_AUTH',
          'ALLOW_USER_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH'
        ],
      });
    });

    it('should enable token revocation', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        EnableTokenRevocation: true,
      });
    });

    it('should prevent user existence errors', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        PreventUserExistenceErrors: 'ENABLED',
      });
    });

    it('should support multiple identity providers', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        SupportedIdentityProviders: ['COGNITO', 'Facebook', 'Google'],
      });
    });
  });
});
