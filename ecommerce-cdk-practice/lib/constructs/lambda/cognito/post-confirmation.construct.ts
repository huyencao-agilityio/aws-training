import { Function, IFunction, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import 'dotenv/config';

import { UserPoolConstructProps } from '@interfaces/construct.interface';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * Construct sets up a Lambda function that
 * handles post-confirmation events from Cognito User Pool
 */
export class PostConfirmationLambdaConstruct extends Construct {
  public readonly postConfirmation: IFunction;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for post-confirmation handling
    this.postConfirmation = new Function(this, 'PostConfirmation', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'post-confirmation.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!post-confirmation.js'],
      }),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
      timeout: Duration.minutes(15),
    });

    // Add IAM policy to allow add user to group in Cognito
    this.postConfirmation.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: [props.userPool.userPoolArn],
      effect: Effect.ALLOW
    }));
  }
}
