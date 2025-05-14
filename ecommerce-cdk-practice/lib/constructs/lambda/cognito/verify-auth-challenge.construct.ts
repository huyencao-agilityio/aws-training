import path from 'path';

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { LAMBDA_PATH } from '@constants/lambda-path.constants';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

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
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'VerifyAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      entry: path.join(__dirname, `${LAMBDA_PATH.AUTH}/verify-auth-challenge.ts`),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
    });

    return lambdaFunction;
  }
}
