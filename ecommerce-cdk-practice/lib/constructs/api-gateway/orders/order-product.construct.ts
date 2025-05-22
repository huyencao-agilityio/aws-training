import { Construct } from 'constructs';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  IResource,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';
import { BaseApiMethodConstruct } from '@shared/base-api-method.construct';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import { HttpMethod } from '@enums/http-method.enum';
import {
  COGNITO_AUTHORIZATION_SCOPES,
  cognitoAuthorizerContext
} from '@constants/auth.constant';
import { COMMON_ERROR_CODE } from '@constants/common-error-code.constant';

/**
 * Define the construct for API POST order product
 */
export class OrderProductApiConstruct extends BaseApiMethodConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const { resource, lambdaFunction, cognitoAuthorizer, models } = props;
    // Define the list error code that need to handle in API
    const errorStatusCodes = [
      ...COMMON_ERROR_CODE,
      HttpStatusCode.FORBIDDEN,
      HttpStatusCode.NOT_FOUND
    ];

    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!.commonResponseModel
    );

    // Add the POST method to the API resource to order product
    // This creates the POST /orders endpoint
    this.addMethod(
      resource,
      lambdaFunction!,
      cognitoAuthorizer!,
      integrationResponses,
      methodResponses,
      models!
    );
  }

  /**
   * Add the POST method to order product
   * @param resource - The API resource
   * @param lambdaFunction - The Lambda function
   * @param cognitoAuthorizer - The Cognito authorizer
   * @param integrationResponses - The integration responses
   * @param methodResponses - The method responses
   */
  addMethod(
    resource: IResource,
    lambdaFunction: IFunction,
    cognitoAuthorizer: CognitoUserPoolsAuthorizer,
    integrationResponses: IntegrationResponse[],
    methodResponses: MethodResponse[],
    models: ApiGatewayModel
  ) {
    resource.addMethod(HttpMethod.POST, new LambdaIntegration(
      lambdaFunction!,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            ${cognitoAuthorizerContext}
            "body": $input.json('$'),
          }`
        },
        integrationResponses: integrationResponses
      }
    ), {
      requestModels: {
        'application/json': models!.orderModel
      },
      authorizer: cognitoAuthorizer,
      authorizationScopes: [
        COGNITO_AUTHORIZATION_SCOPES,
      ],
      methodResponses: methodResponses,
      requestParameters: {
        'method.request.header.Authorization': true
      },
      apiKeyRequired: false,
      authorizationType: AuthorizationType.COGNITO
    });
  }
}
