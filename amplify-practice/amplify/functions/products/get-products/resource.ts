import path from 'path';
import { fileURLToPath } from 'url';

import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { buildResourceName } from '../../../utils/resource.utils';
import { SecretHelper } from '../../../utils/secret.utils';
import { PolicyHelper } from '../../../utils/policy.utils';
import {
  EXTERNAL_MODULES
} from '../../../shared/constants/external-modules.constant';
import {
  ParameterKeys
} from '../../../shared/constants/parameter-keys.constant';
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
 * Define a get products Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The get products Lambda function
 */
function getProductsFn (scope: Construct) {
  const secretName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.SecretName
  );

  // Create a get products Lambda function
  const lambdaFn = new NodejsFunction(scope, 'GetProductsLambda', {
    handler: DEFAULT_LAMBDA_HANDLER,
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, ENTRY_PATH),
    functionName: buildResourceName('get-products'),
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
 * Define a get products Lambda function for the Amplify backend
 */
export const getProducts = defineFunction(
  (scope: Construct) => getProductsFn(scope),
  {
    resourceGroupName: ResourceGroupName.DATA,
  }
);
