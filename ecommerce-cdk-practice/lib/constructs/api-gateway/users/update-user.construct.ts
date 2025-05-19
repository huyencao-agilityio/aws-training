import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  IntegrationResponse,
  IResource,
  LambdaIntegration,
  MethodResponse,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';
import { BaseApiMethodConstruct } from '@shared/base-api-method.construct';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import { HttpMethod } from '@enums/http-method.enum';
import { COMMON_ERROR_CODE } from '@constants/common-error-code.constant';
import {
  COGNITO_AUTHORIZATION_SCOPES,
  cognitoAuthorizerContext
} from '@constants/auth.constant';

/**
 * Define the construct for API PATCH update user detail
 */
export class UpdateUsersDetailApiConstruct extends BaseApiMethodConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const {
      resource,
      lambdaFunction,
      cognitoAuthorizer,
      models
    } = props;
    // Define the list error code that need to handle in API
    const errorStatusCodes = [
      ...COMMON_ERROR_CODE,
      HttpStatusCode.FORBIDDEN,
      HttpStatusCode.NOT_FOUND,
      HttpStatusCode.CONFLICT,
      HttpStatusCode.UNAUTHORIZED
    ];

    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!.updateUserModel
    );

    // Add the PATCH method to the API resource for updating user
    // This creates the PATCH /users/{userId} endpoint
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
   * Add the PATCH method to the API resource
   *
   * @param resource - The API resource
   * @param lambdaFunction - The Lambda function
   * @param cognitoAuthorizer - The Cognito authorizer
   * @param models - The models for the API
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
    resource.addMethod(HttpMethod.PATCH, new LambdaIntegration(
      lambdaFunction!,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            ${cognitoAuthorizerContext}
            "userId": "$input.params('userId')",
            "body": $input.json('$'),
          }`
        },
        integrationResponses: integrationResponses
      }
    ), {
      requestModels: {
        'application/json': models.updateUserModel
      },
      authorizer: cognitoAuthorizer,
      authorizationScopes: [
        COGNITO_AUTHORIZATION_SCOPES,
      ],
      methodResponses: methodResponses,
      requestParameters: {
        'method.request.path.userId': true,
        'method.request.header.Authorization': true
      },
      apiKeyRequired: false,
      authorizationType: AuthorizationType.COGNITO
    });
  }
}
