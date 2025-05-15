import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  IntegrationResponse,
  IResource,
  LambdaIntegration,
  MethodResponse,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';

/**
 * Define the construct for API PATCH update user detail
 */
export class UpdateUsersDetailApiConstruct extends Construct {
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
    const errorStatusCodes = [403, 404, 409, 500];

    // Create integration response for API
    const integrationResponses = this.createIntegrationResponse(
      errorStatusCodes
    );
    // Create method response for API
    const methodResponses = this.createMethodResponse(
      errorStatusCodes,
      models!
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
   * @param models - The models for the API
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
          'application/json': models.updateUserModel,
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
    resource.addMethod('PATCH', new LambdaIntegration(
      lambdaFunction!,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            "userId": "$input.params('userId')",
            "body": $input.json('$'),
            "context" : {
              "sub" : "$context.authorizer.claims.sub",
              "email" : "$context.authorizer.claims.email",
              "group": "$context.authorizer.claims['cognito:groups']"
            }
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
        'aws.cognito.signin.user.admin',
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
