import { defineFunction } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { fileURLToPath } from 'url';
import path from 'path';

import { buildResourceName } from '../../utils/resource.utils';
import {
  EXTERNAL_MODULES
} from '../../shared/constants/external-modules.constant';
import { PolicyHelper } from '../../utils/policy.utils';
import { ParameterKeys } from '../../shared/constants/parameter-keys.constant';
import { SecretHelper } from '../../utils/secret.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a pre-sign up Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The pre-sign up Lambda function
 */
function preSignUpFn (scope: Construct) {
  const secretName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.SecretName
  );

  // Create a pre-sign up Lambda function
  const lambdaFn = new NodejsFunction(scope, 'PreSignUpLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('pre-sign-up'),
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
 * Define a pre-sign up Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The pre-sign up Lambda function
 */
export const preSignUp = defineFunction(
  (scope: Construct) => preSignUpFn(scope),
  {
    resourceGroupName: 'auth',
  }
);
