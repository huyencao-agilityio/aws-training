import {
  AuthorizationType,
  IModel,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model,
  Resource
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import {
  UpdateUserLambdaConstruct
} from '../../lambda/api-gateway/update-user.construct';

/**
 * Define the construct for API PATCH update user detail
 */
export class UpdateUsersDetailApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    // Create the Lambda function for product retrieval
    const updateUserLambdaConstruct = new UpdateUserLambdaConstruct(
      this,
      'GetProductsLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Define the list error code that need to handle in API
    const errorStatusCodes = [403, 404, 409, 500];
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
          'application/json': models!.updateUserModel,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];

    // Add the PATCH method to the API resource for updating user
    // This creates the PATCH /users/{userId} endpoint
    resource.addMethod('PATCH', new LambdaIntegration(
      updateUserLambdaConstruct.updateUserLambda,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            {
              "userId": "$input.params('userId')",
              "body": $input.json('$'),
              "context" : {
                "sub" : "$context.authorizer.claims.sub",
                "email" : "$context.authorizer.claims.email",
                "group": "$context.authorizer.claims['cognito:groups']"
              }
            }
          }`
        },
        integrationResponses: integrationResponses
      }
    ), {
      requestModels: {
        'application/json': models!.updateUserModel
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
