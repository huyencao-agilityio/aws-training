import { defineFunction } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { fileURLToPath } from 'url';
import path from 'path';

import { buildResourceName } from '../../utils/resource.utils';
import {
  EXTERNAL_MODULES
} from '../../shared/constants/external-modules.constant';
import { ParameterKeys } from '../../shared/constants/parameter-keys.constant';
import { SecretHelper } from '../../utils/secret.utils';
import { PolicyHelper } from '../../utils/policy.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a post confirmation Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The post confirmation Lambda function
 */
function postConfirmationFn (scope: Construct) {
  // Get secret name
  const secretName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.SecretName
  );

  // Create a post confirmation Lambda function
  const lambdaFn = new NodejsFunction(scope, 'PostConfirmationLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('post-confirmation'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(15),
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
 * Define a post confirmation Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The post confirmation Lambda function
 */
export const postConfirmation = defineFunction(
  (scope: Construct) => postConfirmationFn(scope),
  {
    resourceGroupName: 'auth',
  }
);
