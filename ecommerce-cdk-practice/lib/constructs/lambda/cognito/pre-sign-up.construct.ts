import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { UserPoolConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@helpers/database.helper';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

/**
 * Construct sets up a Lambda function that
 * handles pre-signup validation in Cognito User Pool
 */
export class PreSignUpLambdaConstruct extends Construct {
  public readonly preSignUp: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

    // Create the Lambda function for pre-signup validation
    this.preSignUp = this.createPreSignUpLambdaFunction(
      librariesLayer!,
      dbInstance,
      userPool
    );
  }

  /**
   * Create the Lambda function for pre-signup validation
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param userPool - The user pool
   * @returns The Lambda function for pre-signup validation
   */
  createPreSignUpLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    userPool: UserPool
  ): Function {
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'PreSignUp', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      layers: [librariesLayer!],
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.COGNITO}/pre-sign-up.ts`
      ),
      environment: {
        ...dbInstance
      },
      timeout: Duration.minutes(15),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      functionName: LAMBDA_FUNCTION_NAME.COGNITO_PRE_SIGNUP
    });

    // Add IAM policy to allow Lambda access to Cognito
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:ListUsers',
        'cognito-idp:AdminLinkProviderForUser',
        'cognito-idp:AdminDeleteUser'
      ],
      resources: [userPool.userPoolArn],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }
}
