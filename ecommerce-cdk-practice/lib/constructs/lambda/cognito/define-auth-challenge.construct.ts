import { Duration } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { LambdaConstructProps } from '@interfaces/construct-props.interface';
/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class DefineAuthChallengeLambdaConstruct extends Construct {
  public readonly defineAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // Lambda for Define Auth Challenge
    this.defineAuthChallenge = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'define-auth-challenge.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!define-auth-challenge.js'],
      }),
      timeout: Duration.minutes(15),
    });
  }
}
