import { Construct } from 'constructs';
import {
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ProviderAttribute,
  UserPool
} from 'aws-cdk-lib/aws-cognito';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';

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

    const secret = Secret.fromSecretNameV2(this, 'Secret', 'secret');

    // Configure Facebook provider
    this.facebookProvider = this.createFacebookProvider(userPool, secret);
    // Configure Google provider
    this.googleProvider = this.createGoogleProvider(userPool, secret);
  }

  /**
   * Create a new Facebook provider
   *
   * @param userPool - The user pool to create the provider for
   * @returns The created provider
   */
  createFacebookProvider(
    userPool: UserPool,
    secret: ISecret
  ): UserPoolIdentityProviderFacebook {
    // Get client credentials from environment variables
    const fbClientId = secret.secretValueFromJson(
      'fb_client_id'
    ).unsafeUnwrap();
    const fbClientSecret = secret.secretValueFromJson(
      'fb_client_secret'
    ).unsafeUnwrap();

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
    userPool: UserPool,
    secret: ISecret
  ): UserPoolIdentityProviderGoogle {
    const googleClientId = secret.secretValueFromJson(
      'google_client_id'
    ).unsafeUnwrap();
    const googleClientSecret = secret.secretValueFromJson(
      'google_client_secret'
    ).unsafeUnwrap();

    // Create google provider
    const provider = new UserPoolIdentityProviderGoogle(
      this,
      'GoogleProvider',
      {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
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
