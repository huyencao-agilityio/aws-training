import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { RequestAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

/**
 * Construct create Lambda function to validates JWT tokens from Cognito User Pool
 * and create method authorizer for API Gateway
 */
export class AuthorizationConstruct extends Construct {
  public readonly lambdaAuthorizer: RequestAuthorizer;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;

    // Create the Lambda function for token validation
    const lambdaAuthorization = this.createLambdaAuthorizationFunction(
      librariesLayer!, userPool
    );
    // Create the API Gateway authorizer
    this.lambdaAuthorizer = this.createRequestAuthorizer(
      lambdaAuthorization
    );
  }

  /**
   * Create the Lambda function for token validation
   *
   * @param librariesLayer - The libraries layer
   * @param userPool - The user pool
   * @returns The Lambda function for token validation
   */
  createLambdaAuthorizationFunction(
    librariesLayer: ILayerVersion,
    userPool: UserPool
  ): Function {
    const lambdaFunction = new Function(
      this,
      'LambdaAuthorizationFunction',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'lambda-authentication.handler',
        code: Code.fromAsset(LAMBDA_PATH.AUTH, {
          exclude: ['**/*', '!lambda-authentication.js'],
        }),
        layers: [librariesLayer!],
        timeout: Duration.seconds(10),
        environment: {
          COGNITO_USER_POOL_ID: userPool.userPoolId,
          COGNITO_REGION: userPool.env.region
        },
      }
    );

    return lambdaFunction;
  }

  /**
   * Create the API Gateway authorizer
   *
   * @param lambdaFunction - The Lambda function
   * @returns The API Gateway authorizer
   */
  createRequestAuthorizer(
    lambdaFunction: Function
  ): RequestAuthorizer {
    const authorize = new RequestAuthorizer(this, 'LambdaAuthorizer', {
      authorizerName: 'LambdaAuthorization',
      handler: lambdaFunction,
      identitySources: ['method.request.header.Authorization'],
      resultsCacheTtl: Duration.seconds(0)
    });

    return authorize;
  }
}
