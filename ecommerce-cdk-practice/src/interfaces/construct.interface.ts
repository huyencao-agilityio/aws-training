import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IResource,
  IRestApi,

} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Function, IFunction, ILayerVersion } from 'aws-cdk-lib/aws-lambda';

import { ApiGatewayModel } from './api-gateway-model.interface';

/**
 * Defines interface the base construct.
 */
export interface BaseConstructProps {
  librariesLayer?: ILayerVersion;
  lambdaFunction?: Function
}

/**
 * Defines interface for the construct that need to related to User Pool.
 */
export interface CognitoEnvContextConstructProps extends BaseConstructProps {
  region?: string;
}

/**
 * Defines interface for the construct that need to related to User Pool.
 */
export interface UserPoolConstructProps extends BaseConstructProps {
  userPool: UserPool;
}

/**
 * Defines interface for base API Gateway Construct
 */
export interface BaseApiGatewayConstructProps extends BaseConstructProps {
  resource: IResource;
  userPool?: UserPool;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
  models?: ApiGatewayModel;
}

/**
 * Defines interface for health check API Construct
 */
export interface HealthCheckApiConstructProps {
  resource: IResource;
}

/**
 * Defines interface for Rest API Model Construct
 */
export interface RestApiModelConstructProps {
  restApi: IRestApi
}

/**
 * Defines interface for the storage bucket Construct
 */
export interface StorageBucketConstructProps {
  bucketName: string;
}
