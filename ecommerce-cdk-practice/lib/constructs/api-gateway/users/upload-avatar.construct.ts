import { Construct } from 'constructs';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  IResource,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';
import { BaseApiMethodConstruct } from '@shared/base-api-method.construct';
import { COMMON_ERROR_CODE } from '@constants/common-error-code.constant';
import {
  COGNITO_AUTHORIZATION_SCOPES,
  cognitoAuthorizerContext
} from '@constants/authorize-api.constant';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import { HttpMethod } from '@enums/http-method.enum';

/**
 * Define the construct for API POST upload avatar
 */
export class UploadAvatarApiConstruct extends BaseApiMethodConstruct {
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
      HttpStatusCode.FORBIDDEN
    ];
    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!.presignedS3Response
    );

    // Add the POST method to the API resource to upload image
    // This creates the POST /users/{userId}/avatar endpoint
    this.addMethod(
      resource,
      lambdaFunction!,
      cognitoAuthorizer!,
      integrationResponses,
      methodResponses,
      models!
    );
  }

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
            "userId": "$input.params('userId')",
            "body": $input.json('$'),
          }`
        },
        integrationResponses: integrationResponses
      }
    ), {
      requestModels: {
        'application/json': models!.uploadAvatarModel
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
