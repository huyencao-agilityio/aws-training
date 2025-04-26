
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { LambdaConstructProps } from '@interface/construct-props.interface';

export class CustomMessageLambdaConstruct extends Construct {
  public readonly customMessage: Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // Lambda for Custom Message
    this.customMessage = new Function(this, 'CustomMessageLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'custom-message.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!custom-message.js'],
      }),
    });
  }
}
