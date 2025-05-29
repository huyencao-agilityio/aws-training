import path from 'path';

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Construct sets up a Lambda function
 * that implements custom authentication flow
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
   * @returns The Lambda function for Verify Auth Challenge
   */
  createVerifyAuthChallengeLambdaFunction(): Function {
    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(
      this,
      'VerifyAuthChallengeLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: DEFAULT_LAMBDA_HANDLER,
        entry: path.join(
          __dirname,
          `${LAMBDA_PATH.COGNITO}/verify-auth-challenge.ts`
        ),
        bundling: {
          externalModules: EXTERNAL_MODULES,
        },
        functionName: buildResourceName(
          this, LAMBDA_FUNCTION_NAME.COGNITO_VERIFY_AUTH
        )
      }
    );

    return lambdaFunction;
  }
}
