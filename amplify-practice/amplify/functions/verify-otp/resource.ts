import { defineFunction } from '@aws-amplify/backend';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildResourceName } from '../../utils/resource.utils';
import {
  EXTERNAL_MODULES
} from '../../shared/constants/external-modules.constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define a verify OTP Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The verify OTP Lambda function
 */
function verifyOtpFn (scope: Construct) {
  // Create a verify OTP Lambda function
  const lambdaFn = new NodejsFunction(scope, 'VerifyOtpLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('verify-otp'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    }
  });

  return lambdaFn;
}

/**
 * Define a verify OTP Lambda function for the Amplify backend
 */
export const verifyOtp = defineFunction(
  (scope: Construct) => verifyOtpFn(scope),
  {
    resourceGroupName: 'data',
  }
);
