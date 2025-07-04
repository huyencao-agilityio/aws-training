import { defineBackend } from '@aws-amplify/backend';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { auth } from './auth/resource';
import { createAuthChallenge } from './auth/create-auth-challenge/resource';
import { preSignUp } from './auth/pre-sign-up/resource';
import { postConfirmation } from './auth/post-confirmation/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { login } from './functions/auth/login/resource';
import { verifyOtp } from './functions/auth/verify-otp/resource';
import { getProducts } from './functions/products/get-products/resource';
import { updateUserProfile } from './functions/users/update-user/resource';
import { uploadAvatar } from './functions/users/upload-avatar/resource';
import { CloudFrontConstruct } from './custom/cloudfront/resource';
import { VpcConstruct } from './custom/vpc/resource';
import { RdsConstruct } from './custom/rds/resource';
import { LambdaLayerConstruct } from './custom/lambda/layer/resource';
import {
  OriginRequestLambdaConstruct
} from './custom/lambda/origin-request/resource';
import { PolicyHelper } from './utils/policy.utils';
import { weeklyReport } from './jobs/weekly-report/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createAuthChallenge,
  preSignUp,
  postConfirmation,
  login,
  verifyOtp,
  getProducts,
  updateUserProfile,
  uploadAvatar,
  weeklyReport
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
const { layer } = new LambdaLayerConstruct(
  customResourceStack,
  'LambdaLayerConstruct'
);
// Create a new VPC and security group
const { vpc, securityGroup } = new VpcConstruct(
  customResourceStack,
  'VpcConstruct'
);
// Create a new RDS instance
const rds = new RdsConstruct(customResourceStack, 'RdsConstruct', {
  vpc,
  securityGroup,
});

// Get the RDS endpoint
const rdsEndpoint = rds.instance.dbInstanceEndpointAddress;
// Get the storage stack
const storageStack = backend.storage.stack;
// Get the bucket
const bucket = backend.storage.resources.bucket;

// Create the Lambda function for origin request
const { originRequestLambda} = new OriginRequestLambdaConstruct(
  customResourceStack,
  'OriginRequestLambdaConstruct'
);

// Create a new CloudFront distribution
const { distribution } = new CloudFrontConstruct(
  storageStack,
  'CloudFrontConstruct',
  {
    bucket,
    lambdaFnVersion: originRequestLambda.currentVersion,
  }
);

// Add policy statement for S3 object CRUD operations
PolicyHelper.s3ObjectCrud(
  storageStack,
  bucket.bucketName,
  originRequestLambda
);
// Add policy statement for CloudFront distribution management
PolicyHelper.cloudfrontManageDistribution(
  storageStack,
  'CloudFrontManageDistribution',
  originRequestLambda.role!.roleName,
  distribution.distributionArn
);

// Add output for backend
backend.addOutput({
  custom: {
    rdsEndpoint,
    cloudfrontDistribution: distribution.domainName,
  },
});

/**********************************************************************/
/* Add layer and environment variables to Lambda functions
/**********************************************************************/
const createAuthChallengeLambda = backend.createAuthChallenge.resources.lambda as NodejsFunction;
createAuthChallengeLambda.addLayers(layer);

const preSignUpLambda = backend.preSignUp.resources.lambda as NodejsFunction;
preSignUpLambda.addLayers(layer);
preSignUpLambda.addEnvironment(
  'DB_HOST',
  rdsEndpoint
);

const postConfirmationLambda = backend.postConfirmation.resources.lambda as NodejsFunction;
postConfirmationLambda.addLayers(layer);
postConfirmationLambda.addEnvironment(
  'DB_HOST',
  rdsEndpoint
);

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

const getProductsLambda = backend.getProducts.resources.lambda as NodejsFunction;
getProductsLambda.addLayers(layer);
getProductsLambda.addEnvironment(
  'DB_HOST',
  rdsEndpoint
);

const updateUserProfileLambda = backend.updateUserProfile.resources.lambda as NodejsFunction;
updateUserProfileLambda.addLayers(layer);
updateUserProfileLambda.addEnvironment(
  'DB_HOST',
  rdsEndpoint
);

const uploadAvatarLambda = backend.uploadAvatar.resources.lambda as NodejsFunction;
uploadAvatarLambda.addLayers(layer);
uploadAvatarLambda.addEnvironment(
  'BUCKET_NAME',
  bucket.bucketName
);

const weeklyReportLambda = backend.weeklyReport.resources.lambda as NodejsFunction;
weeklyReportLambda.addLayers(layer);
weeklyReportLambda.addEnvironment(
  'DB_HOST',
  rdsEndpoint
);
