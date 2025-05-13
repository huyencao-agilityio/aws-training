import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';

import { UserPoolConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@helpers/database.helper';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

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
    const lambdaFunction = new Function(this, 'PreSignUp', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'pre-sign-up.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset(LAMBDA_PATH.AUTH, {
        exclude: ['**/*', '!pre-sign-up.js'],
      }),
      environment: {
        ...dbInstance
      },
      timeout: Duration.minutes(15),
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
