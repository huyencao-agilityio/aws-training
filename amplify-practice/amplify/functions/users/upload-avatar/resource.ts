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
  DEFAULT_LAMBDA_HANDLER
} from '../../../shared/constants/lambda.constant';
import { ENTRY_PATH } from '../../../shared/constants/lambda.constant';
import {
  ResourceGroupName
} from '../../../shared/enums/resource-group-name.enum';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define a upload avatar Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The upload avatar Lambda function
 */
function uploadAvatarFn (scope: Construct) {

  // Create a upload avatar Lambda function
  const lambdaFn = new NodejsFunction(scope, 'UploadAvatarLambda', {
    handler: DEFAULT_LAMBDA_HANDLER,
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, ENTRY_PATH),
    functionName: buildResourceName('upload-avatar'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(3)
  });

  return lambdaFn;
}

/**
 * Define a upload avatar Lambda function for the Amplify backend
 */
export const uploadAvatar = defineFunction(
  (scope: Construct) => uploadAvatarFn(scope),
  {
    resourceGroupName: ResourceGroupName.DATA,
  }
);
