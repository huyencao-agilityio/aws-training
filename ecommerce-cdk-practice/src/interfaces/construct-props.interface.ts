import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IResource,
  IRestApi
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
export interface RestApiResourceConstructProps<T> extends ConstructProps {
  resource: IResource;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
  model: T
}

/**
 * Defines interface for Rest API Model Construct
 */
export interface RestApiModelConstructProps {
  restApi: IRestApi
}
