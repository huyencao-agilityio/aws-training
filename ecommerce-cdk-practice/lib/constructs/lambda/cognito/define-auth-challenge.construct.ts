import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

/**
 * Construct sets up a Lambda function that
 * implements custom authentication flow
 */
export class DefineAuthChallengeLambdaConstruct extends Construct {
  public readonly defineAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Lambda for Define Auth Challenge
    this.defineAuthChallenge = this.createDefineAuthChallengeLambdaFunction(
      librariesLayer!
    );
  }

  /**
   * Create the Lambda function for Define Auth Challenge
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for Define Auth Challenge
   */
  createDefineAuthChallengeLambdaFunction(
    librariesLayer: ILayerVersion
  ): Function {
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      layers: [librariesLayer!],
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.COGNITO}/define-auth-challenge.ts`
      ),
      timeout: Duration.minutes(15),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      functionName: LAMBDA_FUNCTION_NAME.COGNITO_DEFINE_AUTH
    });

    return lambdaFunction;
  }
}
