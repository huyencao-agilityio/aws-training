import path from 'path';

import { Function, Runtime, ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';

import { UserPoolConstructProps } from '@interfaces/construct.interface';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';
import { getDatabaseConfig } from '@shared/database.helper';

/**
 * Construct sets up a Lambda function that
 * handles post-confirmation events from Cognito User Pool
 */
export class PostConfirmationLambdaConstruct extends Construct {
  public readonly postConfirmation: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

    // Create the Lambda function for post-confirmation handling
    this.postConfirmation = this.createPostConfirmationLambdaFunction(
      librariesLayer!,
      dbInstance,
      userPool,
    );
  }

  /**
   * Create the Lambda function for post-confirmation handling
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param userPool - The user pool
   * @returns The Lambda function
    */
  createPostConfirmationLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    userPool: IUserPool,
  ): Function {
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'PostConfirmation', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      layers: [librariesLayer!],
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.COGNITO}/post-confirmation.ts`
      ),
      environment: {
        ...dbInstance
      },
      timeout: Duration.minutes(15),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      functionName: buildResourceName(
        this, LAMBDA_FUNCTION_NAME.COGNITO_POST_CONFIRMATION
      )
    });

    // Add IAM policy for Lambda function
    PolicyHelper.cognitoAddUserToGroup(
      this,
      'PostConfirmLambdaPolicy',
      lambdaFunction.role!.roleName,
      userPool.userPoolArn
    );

    return lambdaFunction;
  }
}
