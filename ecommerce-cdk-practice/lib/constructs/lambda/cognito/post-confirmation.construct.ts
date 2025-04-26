
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import 'dotenv/config';

import { UserPoolLambdaConstructProps } from '@interface/construct-props.interface';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class PostConfirmationLambdaConstruct extends Construct {
  public readonly postConfirmation: Function;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Lambda for Post Confirmation
    this.postConfirmation = new Function(this, 'PostConfirmationLambda', {
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

    this.postConfirmation.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: [props.userPool.userPoolArn],
      effect: Effect.ALLOW
    }));
  }
}
