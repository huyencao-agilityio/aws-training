import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { ConstructProps } from '@interfaces/construct-props.interface';

/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class VerifyAuthChallengeLambdaConstruct extends Construct {
  public readonly verifyAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: ConstructProps) {
    super(scope, id);

    // Lambda for Verify Auth Challenge
    this.verifyAuthChallenge = new Function(this, 'VerifyAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'verify-auth-challenge.handler',
      layers: [props.librariesLayer],
      code: Code.fromAsset('dist/src/lambda-handler/cognito/', {
        exclude: ['**/*', '!verify-auth-challenge.js'],
      })
    });
  }
}
