import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { LAMBDA_PATH } from '@constants/lambda-path.constants';

/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class VerifyAuthChallengeLambdaConstruct extends Construct {
  public readonly verifyAuthChallenge: Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Lambda for Verify Auth Challenge
    this.verifyAuthChallenge = this.createVerifyAuthChallengeLambdaFunction();
  }

  /**
   * Create the Lambda function for Verify Auth Challenge
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for Verify Auth Challenge
   */
  createVerifyAuthChallengeLambdaFunction(): Function {
    const lambdaFunction = new Function(this, 'VerifyAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'verify-auth-challenge.handler',
      code: Code.fromAsset(LAMBDA_PATH.AUTH, {
        exclude: ['**/*', '!verify-auth-challenge.js'],
      })
    });

    return lambdaFunction;
  }
}
