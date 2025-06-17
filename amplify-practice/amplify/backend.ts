import { defineBackend, secret } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { auth } from './auth/resource';
import { createAuthChallenge } from './auth/create-auth-challenge/resource';
import { preSignUp } from './auth/pre-sign-up/resource';
import { postConfirmation } from './auth/post-confirmation/resource';
import { VpcConstruct } from './custom/vpc/resource';
import { RdsConstruct } from './custom/rds/resource';
import { LambdaLayerConstruct } from './custom/lambda/layer/resource';
import { defineAuthChallenge } from './auth/define-auth-challenge/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  createAuthChallenge,
  preSignUp,
  postConfirmation,
  defineAuthChallenge,
});

const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources

// Custom password policy for user pool
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
    temporaryPasswordValidityDays: 7,
    passwordHistorySize: 2,
  },
};

// Custom token validity for user pool client
cfnUserPoolClient.accessTokenValidity = 60;
cfnUserPoolClient.idTokenValidity = 60;
cfnUserPoolClient.refreshTokenValidity = 5;

// Specify token validity units
cfnUserPoolClient.tokenValidityUnits = {
  accessToken: 'minutes',
  idToken: 'minutes',
  refreshToken: 'days',
};

// Create a new stack for custom resources
const customResourceStack = backend.createStack('CustomResourceStack');

// Create a new Lambda layer
const { layer } = new LambdaLayerConstruct(customResourceStack, 'LambdaLayerConstruct');

// Create a new VPC and security group
const { vpc, securityGroup } = new VpcConstruct(customResourceStack, 'VpcConstruct');

// Create a new RDS instance
const rds = new RdsConstruct(customResourceStack, 'RdsConstruct', {
  vpc,
  securityGroup,
});

const rdsEndpoint = rds.instance.dbInstanceEndpointAddress;

// Add output for backend
backend.addOutput({
  custom: {
    rdsEndpoint,
  },
});

backend.createAuthChallenge.resources.lambda.node.addDependency(backend.auth.resources);

const createAuthChallengeLambda = backend.createAuthChallenge.resources.lambda as NodejsFunction;
createAuthChallengeLambda.addLayers(layer);

const preSignUpLambda = backend.preSignUp.resources.lambda as NodejsFunction;
preSignUpLambda.addLayers(layer);

const postConfirmationLambda = backend.postConfirmation.resources.lambda as NodejsFunction;
postConfirmationLambda.addLayers(layer);

const defineAuthChallengeLambda = backend.defineAuthChallenge.resources.lambda as NodejsFunction;
defineAuthChallengeLambda.addLayers(layer);
