import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import { getLibrariesLayer } from '../../src/utils/layer';
import { UserPoolConstruct } from '../constructs/cognito/user-pool.construct';

export class AuthStack extends Stack {
  public readonly userPoolConstruct: UserPoolConstruct;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    this.userPoolConstruct = new UserPoolConstruct(this, 'UserPoolConstruct', {
      librariesLayer: librariesLayer,
      region: this.region
    });

    // Output
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPoolConstruct.userPool.userPoolId,
      description: `User Pool ID`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolConstruct.userPoolClient.userPoolClientId,
      description: `User Pool Client ID`,
    });

    new CfnOutput(this, 'LoginPageUrl', {
      value: `https://ecommerce-cdk-app.auth.${this.region}.amazoncognito.com/login?client_id=${this.userPoolConstruct.userPoolClient.userPoolClientId}&response_type=code&scope=email+openid+profile&redirect_uri=https://ecommerce-app.com`,
      description: 'Login page URL'
    });
  }
}
