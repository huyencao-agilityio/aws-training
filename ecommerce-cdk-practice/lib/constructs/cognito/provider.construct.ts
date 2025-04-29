import { Construct } from 'constructs';
import {
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ProviderAttribute
} from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';

/**
 * Construct for managing social identity providers (Facebook, Google) for Cognito User Pool
 */
export class ProviderConstruct extends Construct {
  public readonly facebookProvider: UserPoolIdentityProviderFacebook;
  public readonly googleProvider: UserPoolIdentityProviderGoogle;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { userPool } = props;

    // Get client credentials from environment variables
    const fbClientId = process.env.FB_CLIENT_ID || '';
    const fbClientSecret = process.env.FB_CLIENT_SECRET || '';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    // Configure Facebook provider
    // This allows users to sign in with their Facebook account
    // Required scopes: public_profile and email
    this.facebookProvider = new UserPoolIdentityProviderFacebook(
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

    // Configure Google provider
    // This allows users to sign in with their Google account
    // Required scopes: profile, email and openid
    this.googleProvider = new UserPoolIdentityProviderGoogle(
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
  }
}
