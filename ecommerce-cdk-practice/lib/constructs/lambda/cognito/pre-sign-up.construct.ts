import { Function, IFunction, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import 'dotenv/config';

import { UserPoolConstructProps } from '@interfaces/construct.interface';

/**
 * Construct sets up a Lambda function that
 * handles pre-signup validation in Cognito User Pool
 */
export class PreSignUpLambdaConstruct extends Construct {
  public readonly preSignUp: IFunction;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for pre-signup validation
    this.preSignUp = new Function(this, 'PreSignUp', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'pre-sign-up.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!pre-sign-up.js'],
      }),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
      timeout: Duration.minutes(15),
    });

    // Add IAM policy to allow Lambda access to Cognito
    this.preSignUp.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:ListUsers',
        'cognito-idp:AdminLinkProviderForUser',
        'cognito-idp:AdminDeleteUser'
      ],
      resources: [props.userPool.userPoolArn],
      effect: Effect.ALLOW
    }));
  }
}
