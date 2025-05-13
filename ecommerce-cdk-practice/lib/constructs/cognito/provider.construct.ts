import { Construct } from 'constructs';
import {
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ProviderAttribute,
  UserPool
} from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

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
    userPool: UserPool
  ): UserPoolIdentityProviderFacebook {
    // Get client credentials from environment variables
    const fbClientId = StringParameter.valueForStringParameter(
      this,
      '/provider/facebook-client-id'
    );
    const fbClientSecret = StringParameter.valueForStringParameter(
      this,
      '/provider/facebook-client-secret'
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
    userPool: UserPool
  ): UserPoolIdentityProviderGoogle {
    // Get client credentials from environment variables
    const googleClientId = StringParameter.valueForStringParameter(
      this,
      '/provider/google-client-id'
    );
    const googleClientSecret = StringParameter.valueForStringParameter(
      this,
      '/provider/google-client-secret'
    );

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
