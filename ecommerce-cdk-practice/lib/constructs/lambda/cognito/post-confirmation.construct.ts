import { Function, Runtime, Code, ILayerVersion } from 'aws-cdk-lib/aws-lambda';
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
 * handles post-confirmation events from Cognito User Pool
 */
export class PostConfirmationLambdaConstruct extends Construct {
  public readonly postConfirmation: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    // Create the Lambda function for post-confirmation handling
    this.postConfirmation = this.createPostConfirmationLambdaFunction(
      librariesLayer!,
      dbInstance,
      userPool
    );
  }

  createPostConfirmationLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    userPool: UserPool
  ): Function {
    const lambdaFunction = new Function(this, 'PostConfirmation', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'post-confirmation.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset(LAMBDA_PATH.AUTH, {
        exclude: ['**/*', '!post-confirmation.js'],
      }),
      environment: {
        ...dbInstance
      },
      timeout: Duration.minutes(15),
    });

    // Add IAM policy to allow add user to group in Cognito
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: [userPool.userPoolArn],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }
}
