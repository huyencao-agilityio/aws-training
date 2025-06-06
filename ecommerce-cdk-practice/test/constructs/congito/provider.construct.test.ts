import { App, SecretValue, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { ProviderConstruct } from '@constructs/cognito/provider.construct';
import { ParameterKeys } from '@constants/parameter-keys.constant';
import { SecretHelper } from '@shared/secret.helper';

// Mock SecretHelper
jest.mock('@shared/secret.helper', () => ({
  SecretHelper: {
    getSecureStringParameter: jest.fn()
      .mockImplementation((scope, id, key) => {
        if (key === ParameterKeys.FacebookClientId) {
          return 'fb-client-id';
        }
        if (key === ParameterKeys.FacebookClientSecret) {
          return 'fb-client-secret';
        }
        if (key === ParameterKeys.GoogleClientId) {
          return 'google-client-id';
        }
        return '';
      }),
    getSecretValue: jest.fn()
      .mockImplementation((key) => {
        if (key === ParameterKeys.GoogleClientSecret) {
          return SecretValue.ssmSecure('google-client-secret');
        }
        return '';
      })
  }
}));

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
        client_id: 'fb-client-id',
        client_secret: 'fb-client-secret',
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
        client_id: 'google-client-id',
        client_secret: Match.stringLikeRegexp('.*google-client-secret.*'),
        authorize_scopes: 'profile email openid'
      },
      AttributeMapping: {
        email: 'email',
        given_name: 'name',
        email_verified: 'email_verified'
      }
    });
  });

  it('should get credentials for Facebook from parameter store', () => {
    expect(SecretHelper.getSecureStringParameter).toHaveBeenCalledWith(
      expect.any(Object),
      'FacebookClientId',
      ParameterKeys.FacebookClientId
    );

    expect(SecretHelper.getSecureStringParameter).toHaveBeenCalledWith(
      expect.any(Object),
      'FacebookClientSecret',
      ParameterKeys.FacebookClientSecret
    );
  });

  it('should get credentials for Google from parameter store', () => {
    expect(SecretHelper.getSecureStringParameter).toHaveBeenCalledWith(
      expect.any(Object),
      'GoogleClientId',
      ParameterKeys.GoogleClientId
    );

    expect(SecretHelper.getSecretValue).toHaveBeenCalledWith(
      ParameterKeys.GoogleClientSecret
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
