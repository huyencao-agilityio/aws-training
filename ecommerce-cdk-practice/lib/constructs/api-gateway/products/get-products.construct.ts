import {
  AuthorizationType,
  IAuthorizer,
  IResource,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import {
  BaseApiGatewayConstructProps
} from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';

/**
 * Define the construct for API POST order product
 */
export class GetProductsApiConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const {
      resource,
      lambdaFunction,
      lambdaAuthorizer,
      models
    } = props;
    // Define the list error code that need to handle in API
    const errorStatusCodes = [401, 400, 500];

    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!
    );

    // Add the GET method to the API resource to get all products
    // This creates the GET /products endpoint
    this.addMethod(
      resource,
      lambdaFunction!,
      lambdaAuthorizer!,
      integrationResponses,
      methodResponses,
      models!
    );
  }

  /**
   * Create the integration response for API
   *
   * @param errorStatusCodes - The list of error status codes
   * @returns The integration response
   */
  createIntegrationResponse(
    errorStatusCodes: number[]
  ): IntegrationResponse[] {
    return [
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
  }

  /**
   * Create the method response for API
   *
   * @param errorStatusCodes - The list of error status codes
   * @param models - The API models
   * @returns The method response
   */
  createMethodResponse(
    errorStatusCodes: number[],
    models: ApiGatewayModel
  ): MethodResponse[] {
    return [
      {
        statusCode: '200',
        responseModels: {
          'application/json': models!.productModel,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];
  }

  /**
   * Add the GET method to the API resource
   *
   * @param resource - The API resource
   * @param lambdaFunction - The Lambda function
   * @param lambdaAuthorizer - The Lambda authorizer
   * @param integrationResponses - The integration responses
   * @param methodResponses - The method responses
   * @param models - The API models
   */
  addMethod(
    resource: IResource,
    lambdaFunction: IFunction,
    lambdaAuthorizer: IAuthorizer,
    integrationResponses: IntegrationResponse[],
    methodResponses: MethodResponse[],
    models: ApiGatewayModel
  ) {
    resource.addMethod('GET', new LambdaIntegration(
      lambdaFunction!,
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
        'application/json': models!.productModel
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
