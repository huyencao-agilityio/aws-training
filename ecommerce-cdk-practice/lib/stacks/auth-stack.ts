import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import { getLibrariesLayer } from '../../src/utils/layer';
import { UserPoolConstruct } from '../constructs/cognito/user-pool.construct';

/**
 * AuthStack is responsible for provisioning all authentication-related resources
 * for the application.
 */
export class AuthStack extends Stack {
  public readonly userPoolConstruct: UserPoolConstruct;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Create user pool construct
    this.userPoolConstruct = new UserPoolConstruct(this, 'UserPoolConstruct', {
      librariesLayer: librariesLayer,
      region: this.region
    });

    // Output for User Pool
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPoolConstruct.userPool.userPoolId,
      description: `User Pool ID`,
    });

    // Output for User Pool Client
    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolConstruct.userPoolClient.userPoolClientId,
      description: `User Pool Client ID`,
    });

    new CfnOutput(this, 'LoginPageUrl', {
      value: `https://ecommerce-cdk-app.auth.${this.region}.amazoncognito.com/login?` +
        `client_id=${this.userPoolConstruct.userPoolClient.userPoolClientId}&` +
        `response_type=code&scope=email+openid+profile&` +
        `redirect_uri=https://ecommerce-app.com`,
      description: 'Login page URL'
    });
  }
}
