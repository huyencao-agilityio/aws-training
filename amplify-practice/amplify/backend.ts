import { defineBackend } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { auth } from './auth/resource';
import { createAuthChallenge } from './auth/create-auth-challenge/resource';
import { preSignUp } from './auth/pre-sign-up/resource';
import { postConfirmation } from './auth/post-confirmation/resource';
import { VpcConstruct } from './custom/vpc/resource';
import { RdsConstruct } from './custom/rds/resource';
import { LambdaLayerConstruct } from './custom/lambda/layer/resource';
import { data } from './data/resource';
import { login } from './functions/login/resource';
import { verifyOtp } from './functions/verify-otp/resource';
import { PolicyHelper } from './utils/policy.utils';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  createAuthChallenge,
  preSignUp,
  postConfirmation,
  login,
  verifyOtp
});

/***********************************/
/* Add config for Cognito
/***********************************/
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;
const userPoolId = cfnUserPool.ref;
const userPoolClientId= cfnUserPoolClient.ref;

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
}
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

/***********************************/
/* Create custom resources
/***********************************/
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
// Get the RDS endpoint
const rdsEndpoint = rds.instance.dbInstanceEndpointAddress;

// Add output for backend
backend.addOutput({
  custom: {
    rdsEndpoint,
  },
});

/**********************************************************************/
/* Add layer and environment variables to Lambda functions
/**********************************************************************/
const createAuthChallengeLambda = backend.createAuthChallenge.resources.lambda as NodejsFunction;
createAuthChallengeLambda.addLayers(layer);

const preSignUpLambda = backend.preSignUp.resources.lambda as NodejsFunction;
preSignUpLambda.addLayers(layer);
preSignUpLambda.addEnvironment('DB_HOST', rds.instance.dbInstanceEndpointAddress);

const postConfirmationLambda = backend.postConfirmation.resources.lambda as NodejsFunction;
postConfirmationLambda.addLayers(layer);
postConfirmationLambda.addEnvironment('DB_HOST', rds.instance.dbInstanceEndpointAddress);

const loginLambda = backend.login.resources.lambda as NodejsFunction;
loginLambda.addLayers(layer);
loginLambda.addEnvironment('USER_POOL_ID', userPoolId);
loginLambda.addEnvironment('CLIENT_ID', userPoolClientId);
loginLambda.addToRolePolicy(
  PolicyHelper.allowAccessCognitoAuth(customResourceStack, userPoolId)
);

const verifyOtpLambda = backend.verifyOtp.resources.lambda as NodejsFunction;
verifyOtpLambda.addLayers(layer);
verifyOtpLambda.addEnvironment('CLIENT_ID', userPoolClientId);
verifyOtpLambda.addToRolePolicy(
  PolicyHelper.allowAccessCognitoAuth(customResourceStack, userPoolId)
);
