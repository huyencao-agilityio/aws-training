import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import { LambdaConstructProps } from '@interfaces/construct-props.interface';

/**
 * Construct sets up a Lambda function that
 * customizes messages sent by Cognito during user lifecycle events
 */
export class CustomMessageLambdaConstruct extends Construct {
  public readonly customMessage: Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // Create the Lambda function for message customization
    this.customMessage = new Function(this, 'CustomMessage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'custom-message.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!custom-message.js'],
      }),
    });

    // Add IAM policy to allow sending emails via SES
    this.customMessage.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
      effect: Effect.ALLOW
    }));
  }
}
