import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

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
    this.customMessage = this.createCustomMessageLambdaFunction(
      librariesLayer!
    );
  }

  /**
   * Create the Lambda function for message customization
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for message customization
   */
  createCustomMessageLambdaFunction(
    librariesLayer: ILayerVersion
  ): Function {
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'CustomMessage', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      layers: [librariesLayer!],
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.COGNITO}/custom-message.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      functionName: LAMBDA_FUNCTION_NAME.COGNITO_CUSTOM_MESSAGE
    });

    return lambdaFunction;
  }
}
