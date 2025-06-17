import { defineFunction } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { buildResourceName } from '../../utils/resource.utils';
import { EXTERNAL_MODULES } from '../../shared/constants/external-modules.constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createAuthChallengeFn (scope: Construct) {
  const defaultEmail = process.env.DEFAULT_EMAIL || '';
  const challengeCode = process.env.CHALLENGE_CODE || '';

  const lambdaFn = new NodejsFunction(scope, 'CreateAuthChallengeLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, './handler.ts'),
    functionName: buildResourceName('create-auth-challenge'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    environment: {
      DEFAULT_EMAIL: defaultEmail,
      CHALLENGE_CODE: challengeCode
    },
  });

  lambdaFn.addToRolePolicy(
    new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
    })
  );

  return lambdaFn;
}

export const createAuthChallenge = defineFunction(
  (scope: Construct) => createAuthChallengeFn(scope),
  {
    resourceGroupName: 'auth',
  }
);
