import { IModel } from 'aws-cdk-lib/aws-apigateway';

/**
 * Define interface for query string parameter in API Gateway
 */
export interface APIGatewayQueryStringParameters {
  page?: string;
  limit?: string;
}

/**
 * Define interface for event request with Lambda authorizer
 */
export interface APIGatewayEventRequestWithLambdaAuthorizer
  extends APIGatewayQueryStringParameters {
  requestContext: {
    authorizer: {
      role: string;
      principalId: string;
      user: {
        sub: string;
        group: string[];
      };
    };
  }
}

/**
 * Define interface for event request with Cogito authorizer
 */
export interface APIGatewayEventRequestWithCognitoAuthorizer {
  context: {
    sub: string;
    email: string;
    group: string;
  }
}

/**
 * Define interface for event request when getting data in API Gateway
 */
export interface APIGatewayEventRequestGetData
  extends APIGatewayQueryStringParameters,
  APIGatewayEventRequestWithCognitoAuthorizer {}

/**
 * Define interface for event request for all nested resource of user resource
 */
export interface APIGatewayEventRequestUserResource<T>
  extends APIGatewayEventRequestWithCognitoAuthorizer {
  userId: string;
  body: T;
}

export interface APIGatewayModel {
  [key: string]: IModel;
}
