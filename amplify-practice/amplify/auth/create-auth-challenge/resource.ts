import path from 'path';
import { fileURLToPath } from 'url';

import { defineFunction } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import 'dotenv/config';

import { buildResourceName } from '../../utils/resource.utils';
import { SecretHelper } from '../../utils/secret.utils';
import { PolicyHelper } from '../../utils/policy.utils';
import {
  EXTERNAL_MODULES
} from '../../shared/constants/external-modules.constant';
import {
  ParameterKeys
} from '../../shared/constants/parameter-keys.constant';
import {
  DEFAULT_LAMBDA_HANDLER,
  ENTRY_PATH
} from '../../shared/constants/lambda.constant';
import {
  ResourceGroupName
} from '../../shared/enums/resource-group-name.enum';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createAuthChallengeFn (scope: Construct) {
  // Get challenge code
  const challengeCode = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.ChallengeCode
  );
  // Get default email address
  const defaultEmailAddress = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.DefaultEmailAddress
  );

  const lambdaFn = new NodejsFunction(scope, 'CreateAuthChallengeLambda', {
    handler: DEFAULT_LAMBDA_HANDLER,
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, ENTRY_PATH),
    functionName: buildResourceName('create-auth-challenge'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    environment: {
      DEFAULT_EMAIL: defaultEmailAddress,
      CHALLENGE_CODE: challengeCode
    },
  });

  lambdaFn.addToRolePolicy(
    PolicyHelper.allowSesSendEmail(scope, defaultEmailAddress)
  );

  return lambdaFn;
}

export const createAuthChallenge = defineFunction(
  (scope: Construct) => createAuthChallengeFn(scope),
  {
    resourceGroupName: ResourceGroupName.AUTH
  }
);
