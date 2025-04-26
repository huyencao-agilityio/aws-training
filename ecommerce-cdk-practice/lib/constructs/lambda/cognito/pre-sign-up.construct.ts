import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import 'dotenv/config';

import { UserPoolLambdaConstructProps } from '@interface/construct-props.interface';

export class PreSignUpLambdaConstruct extends Construct {
  public readonly preSignUp: Function;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Lambda for Pre Sign Up
    this.preSignUp = new Function(this, 'PreSignUpLambda', {
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

    // Add role policy for Lambda functions
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
