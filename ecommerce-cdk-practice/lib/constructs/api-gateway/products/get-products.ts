import {
  AuthorizationType,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import { ProductsLambdaConstruct } from '../../lambda/api-gateway/products.construct';

/**
 * Define the construct for API POST order product
 */
export class GetProductsApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const {
      resource,
      userPool,
      librariesLayer,
      lambdaAuthorizer,
      models
    } = props;

    // Create the Lambda function for product retrieval
    const productsLambdaConstruct = new ProductsLambdaConstruct(
      scope, 'GetProductsLambdaConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool!
      }
    );

    // Define the list error code that need to handle in API
    const errorStatusCodes = [401, 400, 500];
    // Create integration response for API
    const integrationResponses: IntegrationResponse[] = [
      {
        statusCode: '200',
      },
      ...errorStatusCodes.map(code => ({
        selectionPattern: `.*"statusCode":${code}.*`,
        statusCode: `${code}`,
        responseTemplates: {
          'application/json': '#set($inputRoot = $input.path("$"))\n$inputRoot.errorMessage'
        }
      })),
    ];
    const methodResponses: MethodResponse[] = [
      {
        statusCode: '200',
        responseModels: {
          'application/json': models.productsModel,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];

    // Add the GET method to the API resource to get all products
    // This creates the GET /products endpoint
    resource.addMethod('GET', new LambdaIntegration(
      productsLambdaConstruct.getProductsLambda,
      {
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
        integrationResponses: integrationResponses
      }
    ), {
      requestModels: {
        'application/json': models.productsModel
      },
      authorizer: lambdaAuthorizer,
      authorizationScopes: [
        'aws.cognito.signin.user.admin',
      ],
      methodResponses: methodResponses,
      requestParameters: {
        'method.request.querystring.limit': false,
        'method.request.querystring.page': false,
        'method.request.header.Authorization': true
      },
      apiKeyRequired: false,
      authorizationType: AuthorizationType.CUSTOM
    });

  }
}
