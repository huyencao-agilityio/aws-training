import { Construct } from 'constructs';
import {
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ProviderAttribute,
  IUserPool
} from 'aws-cdk-lib/aws-cognito';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';
import { SecretHelper } from '@shared/secret.helper';
import { ParameterKeys } from '@constants/parameter-keys.constant';

/**
 * Construct for managing social identity providers (Facebook, Google)
 * for Cognito User Pool
 */
export class ProviderConstruct extends Construct {
  public readonly facebookProvider: UserPoolIdentityProviderFacebook;
  public readonly googleProvider: UserPoolIdentityProviderGoogle;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { userPool } = props;

    // Configure Facebook provider
    this.facebookProvider = this.createFacebookProvider(userPool);
    // Configure Google provider
    this.googleProvider = this.createGoogleProvider(userPool);
  }

  /**
   * Create a new Facebook provider
   *
   * @param userPool - The user pool to create the provider for
   * @returns The created provider
   */
  createFacebookProvider(
    userPool: IUserPool
  ): UserPoolIdentityProviderFacebook {
    // Get facebook client id and secret from SSM Parameter Store
    const fbClientId = SecretHelper.getSecureStringParameter(
      this,
      'FacebookClientId',
      ParameterKeys.FacebookClientId
    );
    const fbClientSecret = SecretHelper.getSecureStringParameter(
      this,
      'FacebookClientSecret',
      ParameterKeys.FacebookClientSecret
    );

    // Create provider
    const provider = new UserPoolIdentityProviderFacebook(
      this,
      'FacebookProvider',
      {
        clientId: fbClientId,
        clientSecret: fbClientSecret,
        userPool: userPool,
        scopes: ['public_profile', 'email'],
        attributeMapping: {
          email: ProviderAttribute.FACEBOOK_EMAIL,
          givenName: ProviderAttribute.FACEBOOK_NAME
        }
      }
    );

    return provider;
  }

  /**
   * Create a new Google provider
   *
   * @param userPool - The user pool to create the provider for
   * @returns The created provider
   */
  createGoogleProvider(
    userPool: IUserPool
  ): UserPoolIdentityProviderGoogle {
    // Get google client id and secret from SSM Parameter Store
    const googleClientId = SecretHelper.getSecureStringParameter(
      this,
      'GoogleClientId',
      ParameterKeys.GoogleClientId
    );
    const googleClientSecret = SecretHelper.getSecretValue(
      ParameterKeys.GoogleClientSecret
    );

    // Create google provider
    const provider = new UserPoolIdentityProviderGoogle(
      this,
      'GoogleProvider',
      {
        clientId: googleClientId,
        clientSecretValue: googleClientSecret,
        userPool: userPool,
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          givenName: ProviderAttribute.GOOGLE_NAME,
          emailVerified: ProviderAttribute.GOOGLE_EMAIL_VERIFIED
        }
      }
    );

    return provider;
  }
}
