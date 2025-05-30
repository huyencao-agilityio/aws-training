import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

import { AuthStack } from '@stacks/auth.stack';

describe('TestApiStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App({
      context: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Get hosted zone from Route53
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'ecommerce-app.click',
      }
    );

    // Get certificate from existing certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestCertificate',
      'arn:aws:acm:us-east-1:123456789012:certificate/TestCertificate'
    );

    // Create new auth stack
    const authStack = new AuthStack(app, 'TestAuthStack', {
      hostedZone,
      domainName: 'api.ecommerce-app.click',
      certificate,
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    template = Template.fromStack(authStack);
  });

  describe('Count total resources in Auth Stack', () => {
    it('should create a User Pool', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    it('should create two groups', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolGroup', 2);
    });

    it('should create a CNAME record', () => {
      template.resourceCountIs('AWS::Route53::RecordSet', 1);
    });

    it('should create total six lambda functions', () => {
      template.resourceCountIs('AWS::Lambda::Function', 6);
    });

    it('should create Facebook and Google identity providers', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolIdentityProvider', 2);
    });
  });

  describe('Config Lambda Trigger for Cognito', () => {
    it('should add create auth challenge lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          CreateAuthChallenge: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*CreateAuthChallenge.*'),
              'Arn'
            ]
          }
        },
      });
    });

    it('should add define auth challenge lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          DefineAuthChallenge: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*DefineAuthChallenge.*'),
              'Arn'
            ]
          }
        },
      });
    });

    it('should add verify auth challenge lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          VerifyAuthChallengeResponse: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*VerifyAuthChallenge.*'),
              'Arn'
            ]
          }
        },
      });
    });

    it('should add custom message lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          CustomMessage: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*CustomMessage.*'),
              'Arn'
            ]
          }
        },
      });
    });

    it('should add post confirmation lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          PostConfirmation: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*PostConfirmation.*'),
              'Arn'
            ]
          }
        },
      });
    });

    it('should add pre sign up lambda trigger', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        LambdaConfig: {
          PreSignUp: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*PreSignUp.*'),
              'Arn'
            ]
          }
        },
      });
    });
  });

  describe('Output in Auth Stack', () => {
    it('should create output for User Pool Id', () => {
      template.hasOutput('UserPoolId', {
        Value: {
          Ref: Match.stringLikeRegexp('.*UserPoolConstruct.*')
        }
      });
    });

    it('should create output for User Pool Client Id', () => {
      template.hasOutput('UserPoolClientId', {
        Value: {
          Ref: Match.stringLikeRegexp('.*UserPoolConstruct.*')
        },
      });
    });

    it('should create output for Login Page URL', () => {
      template.hasOutput('LoginPageUrl',  {
        Value: {
          'Fn::Join': [
            '',
            [
              'https://ecommerce-cdk-app.auth.us-east-1.amazoncognito.com/login?client_id=',
              {
                Ref: Match.stringLikeRegexp('.*UserPoolConstruct.*')
              },
              '&response_type=code&scope=email+openid+profile&redirect_uri=https://ecommerce-app.com'
            ]
          ]
        },
      });
    });
  });
});
