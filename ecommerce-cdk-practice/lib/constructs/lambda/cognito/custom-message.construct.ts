import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import 'dotenv/config';

import { BaseConstructProps } from '@interfaces/construct.interface';

/**
 * Construct sets up a Lambda function that
 * customizes messages sent by Cognito during user lifecycle events
 */
export class CustomMessageLambdaConstruct extends Construct {
  public readonly customMessage: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Create the Lambda function for message customization
    this.customMessage = new Function(this, 'CustomMessage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'custom-message.handler',
      layers: [librariesLayer!],
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
