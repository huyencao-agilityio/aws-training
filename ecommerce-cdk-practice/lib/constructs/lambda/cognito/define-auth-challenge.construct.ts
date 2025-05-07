import { Duration } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';

/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class DefineAuthChallengeLambdaConstruct extends Construct {
  public readonly defineAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Lambda for Define Auth Challenge
    this.defineAuthChallenge = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'define-auth-challenge.handler',
      layers: [librariesLayer!],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!define-auth-challenge.js'],
      }),
      timeout: Duration.minutes(15),
    });
  }
}
