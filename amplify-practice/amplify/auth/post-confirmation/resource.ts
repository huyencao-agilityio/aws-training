import { defineFunction } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import path from 'path';
import { Construct } from 'constructs';
import { fileURLToPath } from 'url';

import { buildResourceName } from '../../utils/resource.utils';

import { EXTERNAL_MODULES } from '../../shared/constants/external-modules.constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function postConfirmationFn (scope: Construct) {
  const lambdaFn = new NodejsFunction(scope, 'PostConfirmationLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('post-confirmation'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(15),
  });

  return lambdaFn;
}

export const postConfirmation = defineFunction(
  (scope: Construct) => postConfirmationFn(scope),
  {
    resourceGroupName: 'auth',
  }
);
