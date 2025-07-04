import path from 'path';
import { fileURLToPath } from 'url';

import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { buildResourceName } from '../../../utils/resource.utils';
import {
  EXTERNAL_MODULES
} from '../../../shared/constants/external-modules.constant';
import {
  DEFAULT_LAMBDA_HANDLER,
  ENTRY_PATH
} from '../../../shared/constants/lambda.constant';
import {
  ResourceGroupName
} from '../../../shared/enums/resource-group-name.enum';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define a login Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The login Lambda function
 */
function loginFn (scope: Construct) {
  // Create a login Lambda function
  const lambdaFn = new NodejsFunction(scope, 'LoginLambda', {
    handler: DEFAULT_LAMBDA_HANDLER,
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, ENTRY_PATH),
    functionName: buildResourceName('login-api'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(3)
  });

  return lambdaFn;
}

/**
 * Define a login Lambda function for the Amplify backend
 */
export const login = defineFunction(
  (scope: Construct) => loginFn(scope),
  {
    resourceGroupName: ResourceGroupName.DATA,
  }
);
