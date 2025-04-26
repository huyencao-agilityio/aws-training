import { Duration } from 'aws-cdk-lib';
import {
  AuthorizationType,
  IAuthorizer,
  LambdaIntegration,
  Model,
  Resource
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { GetProductsLambdaConstruct } from '../../lambda/api-gateway/get-products.construct';

export const getProductsMethod = (
  scope: Construct,
  productsResource: Resource,
  authorizer: IAuthorizer,
  librariesLayer: ILayerVersion,
  userPool: UserPool
): void => {
  // Create Lambda function
  const getProductsLambdaConstruct = new GetProductsLambdaConstruct(scope, 'GetProductsLambdaConstruct', {
    librariesLayer: librariesLayer,
    userPool: userPool
  });

  // Add GET method for products
  productsResource.addMethod('GET', new LambdaIntegration(getProductsLambdaConstruct.getProductsLambda, {
    proxy: false,
    requestTemplates: {
      'application/json': `{
        "requestContext": {
          "authorizer": {
            "role": "$util.escapeJavaScript($context.authorizer.role)",
            "principalId": "$util.escapeJavaScript($context.authorizer.principalId)",
            "user": "$util.escapeJavaScript($context.authorizer.user)"
          }
        },
        "page": "$util.escapeJavaScript($input.params('page'))",
        "limit": "$util.escapeJavaScript($input.params('limit'))"
      }`
    },
    integrationResponses: [
      {
        statusCode: '200'
      },
      {
        selectionPattern: '.*"statusCode":400.*',
        statusCode: '400',
        responseTemplates: {
          'application/json': '#set($inputRoot = $input.path("$"))\n$inputRoot.errorMessage'
        }
      },
      {
        selectionPattern: '.*"statusCode":401.*',
        statusCode: '401',
        responseTemplates: {
          'application/json': '#set($inputRoot = $input.path("$"))\n$inputRoot.errorMessage'
        }
      },
      {
        selectionPattern: '.*"statusCode":500.*',
        statusCode: '500',
        responseTemplates: {
          'application/json': '#set($inputRoot = $input.path("$"))\n$inputRoot.errorMessage'
        }
      }
    ]
  }), {
    authorizer: authorizer,
    methodResponses: [
      {
        statusCode: '200',
        responseModels: {
          'application/json': Model.EMPTY_MODEL
        }
      },
      {
        statusCode: '400',
        responseModels: {
          'application/json': Model.ERROR_MODEL
        }
      },
      {
        statusCode: '401',
        responseModels: {
          'application/json': Model.ERROR_MODEL
        }
      },
      {
        statusCode: '500',
        responseModels: {
          'application/json': Model.ERROR_MODEL
        }
      }
    ],
    requestParameters: {
      'method.request.querystring.limit': false,
      'method.request.querystring.page': false,
      'method.request.header.Authorization': true
    },
    apiKeyRequired: false,
    authorizationType: AuthorizationType.CUSTOM
  });
};
