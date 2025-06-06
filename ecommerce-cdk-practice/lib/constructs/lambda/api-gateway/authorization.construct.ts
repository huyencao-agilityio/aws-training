import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Construct create Lambda function to validates JWT tokens
 * from Cognito User Pool and create method authorizer for API Gateway
 */
export class AuthorizationLambdaConstruct extends Construct {
  public readonly authorizationLambda: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;

    // Create the Lambda function for token validation
    this.authorizationLambda = this.createLambdaAuthorizationFunction(
      librariesLayer!,
      userPool
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
    userPool: IUserPool
  ): Function {
    const lambdaFunction = new NodejsFunction(
      this,
      'LambdaAuthorizationFunction',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: DEFAULT_LAMBDA_HANDLER,
        entry: path.join(
          __dirname,
          `${LAMBDA_PATH.AUTH}/lambda-authentication.ts`
        ),

        layers: [librariesLayer!],
        timeout: Duration.seconds(10),
        environment: {
          COGNITO_USER_POOL_ID: userPool.userPoolId,
          COGNITO_REGION: userPool.env.region
        },
        functionName: buildResourceName(
          this, LAMBDA_FUNCTION_NAME.API_LAMBDA_AUTHENTICATION
        )
      }
    );

    return lambdaFunction;
  }
}
