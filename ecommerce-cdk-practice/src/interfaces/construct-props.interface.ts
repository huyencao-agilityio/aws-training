import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IResource,
  IRestApi,
  Model,
  IModel
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';

/**
 * Defines interface for Lambda construct properties.
 */
export interface ConstructProps {
  librariesLayer: ILayerVersion;
}

/**
 * Defines interface for Lambda constructs
 * that using Cognito User Pool.
 */
export interface UserPoolLambdaConstructProps extends ConstructProps {
  userPool: UserPool;
}

/**
 * Defines interface for User Pool construct.
 */
export interface UserPoolConstructProps extends ConstructProps {
  region: string;
}

/**
 * Defines interface for Rest API Resource Construct
 */
export interface BaseRestApiConstructProps extends ConstructProps {
  resource: IResource;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
}

/**
 * Define interface for resource in rest api
 */
export interface RestApiResourceConstructProps extends BaseRestApiConstructProps {
  models: {
    [key: string]: IModel;
  };
}

/**
 * Define interface for the resource contain model in request and response
 */
export interface ModelConstructProps extends BaseRestApiConstructProps {
  model: IModel;
}

/**
 * Defines interface for Rest API Model Construct
 */
export interface RestApiModelConstructProps {
  restApi: IRestApi
}
