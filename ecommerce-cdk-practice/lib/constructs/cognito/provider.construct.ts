import { Construct } from 'constructs';
import {
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ProviderAttribute
} from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';

import { UserPoolLambdaConstructProps } from '@interface/construct-props.interface';

export class ProviderConstruct extends Construct {
  public readonly facebookProvider: UserPoolIdentityProviderFacebook;
  public readonly googleProvider: UserPoolIdentityProviderGoogle;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

    const fbClientId = process.env.FB_CLIENT_ID || '';
    const fbClientSecret = process.env.FB_CLIENT_SECRET || '';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    this.facebookProvider = new UserPoolIdentityProviderFacebook(this, 'FacebookProvider', {
      clientId: fbClientId,
      clientSecret: fbClientSecret,
      userPool: props.userPool,
      scopes: ['public_profile', 'email'],
      attributeMapping: {
        email: ProviderAttribute.FACEBOOK_EMAIL,
        givenName: ProviderAttribute.FACEBOOK_NAME
      }
    });

    this.googleProvider = new UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      userPool: props.userPool,
      scopes: ['profile', 'email', 'openid'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_NAME,
        emailVerified: ProviderAttribute.GOOGLE_EMAIL_VERIFIED
      }
    });
  }
}
