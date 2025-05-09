import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import 'dotenv/config';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { DEFAULT_EMAIL_ADDRESS } from '@constants/email.constant';

/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class CreateAuthChallengeLambdaConstruct extends Construct {
  public readonly createAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    const challengeCode = process.env.CHALLENGE_CODE || '';

    // Lambda for Create Auth Challenge
    this.createAuthChallenge = new Function(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'create-auth-challenge.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!create-auth-challenge.js'],
      }),
      environment: {
        DEFAULT_EMAIL: DEFAULT_EMAIL_ADDRESS,
        CHALLENGE_CODE: challengeCode
      },
    });

    // Add IAM policy to allow sending emails via SES
    this.createAuthChallenge.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
      effect: Effect.ALLOW
    }));
  }
}
