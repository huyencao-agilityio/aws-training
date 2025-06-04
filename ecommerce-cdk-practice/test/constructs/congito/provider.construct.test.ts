import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { ProviderConstruct } from '@constructs/cognito/provider.construct';


describe('TestProviderConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Create user pool
    const userPool = new UserPool(stack, 'TestUserPool');

    // Create provider construct
    new ProviderConstruct(stack, 'TestProviderConstruct', {
      userPool
    });

    template = Template.fromStack(stack);
  });

  it('should create Facebook and Google identity providers', () => {
    template.resourceCountIs('AWS::Cognito::UserPoolIdentityProvider', 2);
  });

  it('should create Facebook identity providers with correct config', () => {
    // Check Facebook Identity Provider
    template.hasResourceProperties('AWS::Cognito::UserPoolIdentityProvider', {
      ProviderName: 'Facebook',
      ProviderType: 'Facebook',
      UserPoolId: {
        Ref: Match.stringLikeRegexp('.*TestUserPool.*')
      },
      ProviderDetails: {
        client_id: {
          Ref: Match.stringLikeRegexp('.*facebookclientid.*')
        },
        client_secret: {
          Ref: Match.stringLikeRegexp('.*facebookclientsecret.*')
        },
        authorize_scopes: 'public_profile,email'
      },
      AttributeMapping: {
        email: 'email',
        given_name: 'name'
      }
    });
  });

  it('should create Google identity providers with correct config', () => {
    // Check Google Identity Provider
    template.hasResourceProperties('AWS::Cognito::UserPoolIdentityProvider', {
      ProviderName: 'Google',
      ProviderType: 'Google',
      UserPoolId: {
        Ref: Match.stringLikeRegexp('.*TestUserPool.*')
      },
      ProviderDetails: {
        client_id: {
          Ref: Match.stringLikeRegexp('.*googleclientid.*')
        },
        client_secret: Match.stringLikeRegexp('.*google_client_secret.*'),
        authorize_scopes: 'profile email openid'
      },
      AttributeMapping: {
        email: 'email',
        given_name: 'name',
        email_verified: 'email_verified'
      }
    });
  });
});
