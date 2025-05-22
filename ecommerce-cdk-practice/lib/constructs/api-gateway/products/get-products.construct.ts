import {
  AuthorizationType,
  IAuthorizer,
  IResource,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import {
  BaseApiGatewayConstructProps
} from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';
import { BaseApiMethodConstruct } from '@shared/base-api-method.construct';
import { COMMON_ERROR_CODE } from '@constants/common-error-code.constant';
import { lambdaAuthorizerContext } from '@constants/auth.constant';
import { HttpMethod } from '@enums/http-method.enum';

/**
 * Define the construct for API GET products
 */
export class GetProductsApiConstruct extends BaseApiMethodConstruct {
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
    const errorStatusCodes = [
      ...COMMON_ERROR_CODE,
    ];

    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!.productModel
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
   * Add the GET method to get all products
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
    resource.addMethod(HttpMethod.GET, new LambdaIntegration(
      lambdaFunction!,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            ${lambdaAuthorizerContext}
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
