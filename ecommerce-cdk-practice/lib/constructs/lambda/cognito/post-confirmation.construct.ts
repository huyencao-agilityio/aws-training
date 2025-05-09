import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import 'dotenv/config';

import { UserPoolConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@helpers/database.helper';

/**
 * Construct sets up a Lambda function that
 * handles post-confirmation events from Cognito User Pool
 */
export class PostConfirmationLambdaConstruct extends Construct {
  public readonly postConfirmation: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    // Create the Lambda function for post-confirmation handling
    this.postConfirmation = new Function(this, 'PostConfirmation', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'post-confirmation.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!post-confirmation.js'],
      }),
      environment: {
        ...dbInstance
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
