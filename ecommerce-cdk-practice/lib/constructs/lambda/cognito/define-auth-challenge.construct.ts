import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

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
    const lambdaFunction = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'define-auth-challenge.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset(LAMBDA_PATH.AUTH, {
        exclude: ['**/*', '!define-auth-challenge.js'],
      }),
      timeout: Duration.minutes(15),
    });

    return lambdaFunction;
  }
}
