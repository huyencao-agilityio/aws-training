import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  CfnUserPool,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolEmail,
  VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import {
  CognitoConstructProps
} from '@interfaces/construct.interface';
import { COGNITO } from '@constants/cognito.constant';

/**
 * Construct for managing Cognito User Pool and its associated resources
 * This construct handles the complete setup of user authentication including:
 * - User Pool configuration (password policy, MFA, email settings)
 * - Custom authentication flows using Lambda triggers
 * - Social identity providers (Facebook, Google)
 * - User groups and permissions
 * - App client configuration with OAuth settings
 */
export class UserPoolConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly domain: UserPoolDomain;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    const { region, domainName, certificate } = props;


    /**
     * Create the User Pool with:
     * Strong password policy
     * Email verification required
     * SES for email delivery
     * Standard attributes for user profile
     */
    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: COGNITO.USER_POOL_NAME,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true }
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(7),
        passwordHistorySize: 2
      },
      mfa: Mfa.OFF,
      email: UserPoolEmail.withSES({
        fromEmail: COGNITO.EMAIL.FROM,
        sesRegion: region
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      userVerification: {
        emailSubject: COGNITO.EMAIL.SUBJECT,
        emailBody: COGNITO.EMAIL.BODY,
        emailStyle: VerificationEmailStyle.LINK
      }
    });

    // Add a custom domain to the User Pool
    this.domain = this.userPool.addDomain('CognitoCustomDomain', {
      customDomain: {
        domainName,
        certificate,
      },
    });

    // Configure user attribute update settings
    // This ensures email verification is required before updating email
    const cfnUserPool = this.userPool.node.defaultChild as CfnUserPool;
    cfnUserPool.userAttributeUpdateSettings = {
      attributesRequireVerificationBeforeUpdate: ['email'],
    };

    // Create user groups for role-based access control
    // These groups determine what permissions users have in the system
    new CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: COGNITO.GROUPS.ADMIN.NAME,
      userPoolId: this.userPool.userPoolId,
      description: COGNITO.GROUPS.ADMIN.DESCRIPTION,
    });

    new CfnUserPoolGroup(this, 'UserGroup', {
      groupName: COGNITO.GROUPS.USER.NAME,
      userPoolId: this.userPool.userPoolId,
      description: COGNITO.GROUPS.USER.DESCRIPTION,
    });

    // Create the App Client with OAuth configuration
    // This client is used by applications to authenticate users
    this.userPoolClient = this.userPool.addClient('AppClient', {
      userPoolClientName: COGNITO.CLIENT_NAME,
      accessTokenValidity: Duration.minutes(60),
      idTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(5),
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      authFlows: {
        custom: true,
        user: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.FACEBOOK,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          OAuthScope.COGNITO_ADMIN,
          OAuthScope.EMAIL,
          OAuthScope.OPENID,
          OAuthScope.PHONE,
          OAuthScope.PROFILE,
        ],
        callbackUrls: [COGNITO.REDIRECT_URI],
        logoutUrls: [COGNITO.LOGOUT_URI],
      },
    });
  }
}
