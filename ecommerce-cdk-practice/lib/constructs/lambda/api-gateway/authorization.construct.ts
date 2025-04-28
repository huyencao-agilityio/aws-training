import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { RequestAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import {
  UserPoolLambdaConstructProps
} from '@interface/construct-props.interface';

/**
 * Construct create Lambda function to validates JWT tokens from Cognito User Pool
 * and create method authorizer for API Gateway
 */
export class AuthorizationConstruct extends Construct {
  public readonly lambdaAuthorization: Function;
  public readonly lambdaAuthorizer: RequestAuthorizer;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

    // Create the Lambda function for token validation
    this.lambdaAuthorization = new Function(this, 'LambdaAuthorization', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'lambda-authentication.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/auth/', {
        exclude: ['**/*', '!lambda-authentication.js'],
      }),
      layers: [props.librariesLayer],
      timeout: Duration.seconds(10),
      environment: {
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_REGION: props.userPool.env.region
      },
    });

    // Create the API Gateway authorizer
    this.lambdaAuthorizer = new RequestAuthorizer(this, 'LambdaAuthorizer', {
      authorizerName: 'LambdaAuthorization',
      handler: this.lambdaAuthorization,
      identitySources: ['method.request.header.Authorization'],
      resultsCacheTtl: Duration.seconds(0),
    });
  }
}
