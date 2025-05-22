import { Construct } from 'constructs';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  IntegrationResponse,
  IResource,
  LambdaIntegration,
  MethodResponse
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { BaseApiMethodConstruct } from '@shared/base-api-method.construct';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import { HttpMethod } from '@enums/http-method.enum';
import { COMMON_ERROR_CODE } from '@constants/common-error-code.constant';
import {
  COGNITO_AUTHORIZATION_SCOPES,
  cognitoAuthorizerContext
} from '@constants/auth.constant';

/**
 * Define the construct for API POST accept order
 */
export class AcceptOrderApiConstruct extends BaseApiMethodConstruct {
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

    // Add the POST method to the API resource to accept order
    // This creates the POST /orders/{orderId}/accept endpoint
    this.addMethod(
      resource,
      lambdaFunction!,
      cognitoAuthorizer!,
      integrationResponses,
      methodResponses
    );
  }

  /**
   * Add the POST method to accept order
   *
   * @param resource - The API resource
   * @param lambdaFunction - The Lambda function
   * @param cognitoAuthorizer - The Cognito authorizer
   * @param models - The API models
   * @param integrationResponses - The integration responses
   * @param methodResponses - The method responses
   */
  addMethod(
    resource: IResource,
    lambdaFunction: IFunction,
    cognitoAuthorizer: CognitoUserPoolsAuthorizer,
    integrationResponses: IntegrationResponse[],
    methodResponses: MethodResponse[]
  ) {
    // Add the POST method to the API resource
    resource.addMethod(HttpMethod.POST, new LambdaIntegration(
      lambdaFunction!,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            ${cognitoAuthorizerContext}
            "orderId": "$input.params('orderId')",
          }`
        },
        integrationResponses: integrationResponses
      }
    ), {
      authorizer: cognitoAuthorizer,
      authorizationScopes: [
        COGNITO_AUTHORIZATION_SCOPES,
      ],
      methodResponses: methodResponses,
      requestParameters: {
        'method.request.path.orderId': true,
        'method.request.header.Authorization': true
      },
      apiKeyRequired: false,
      authorizationType: AuthorizationType.COGNITO
    });
  }
}
