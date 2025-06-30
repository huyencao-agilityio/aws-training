import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildResourceName } from '../../../utils/resource.utils';
import { SecretHelper } from '../../../utils/secret.utils';
import { PolicyHelper } from '../../../utils/policy.utils';
import {
  EXTERNAL_MODULES
} from '../../../shared/constants/external-modules.constant';
import { ParameterKeys } from '../../../shared/constants/parameter-keys.constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define a update user Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The update user Lambda function
 */
function updateUserFn (scope: Construct) {
  const secretName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.SecretName
  );

  // Create a update user Lambda function
  const lambdaFn = new NodejsFunction(scope, 'UpdateUserLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('update-user'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(3),
    environment: {
      SECRET_NAME: secretName
    }
  });

  // Add a policy statement to the Lambda function
  lambdaFn.addToRolePolicy(
    PolicyHelper.allowSecretManagerGetValue(scope, secretName)
  );

  return lambdaFn;
}

/**
 * Define a update user Lambda function for the Amplify backend
 */
export const updateUserProfile = defineFunction(
  (scope: Construct) => updateUserFn(scope),
  {
    resourceGroupName: 'data',
  }
);
