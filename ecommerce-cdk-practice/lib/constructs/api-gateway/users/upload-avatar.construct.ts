import { Construct } from 'constructs';
import {
  AuthorizationType,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model
} from 'aws-cdk-lib/aws-apigateway';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import {
  UploadAvatarLambdaConstruct
} from '../../lambda/api-gateway/upload-avatar.construct';

/**
 * Define the construct for API POST upload avatar
 */
export class UploadAvatarApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    // Create the Lambda function for product retrieval
    const uploadAvatarLambdaConstruct = new UploadAvatarLambdaConstruct(
      this,
      'GetProductsLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Define the list error code that need to handle in API
    const errorStatusCodes = [403, 500];
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
          'application/json': models!.presignedS3Response,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];

    // Add the POST method to the API resource to upload image
    // This creates the POST /users/{userId}/avatar endpoint
    resource.addMethod('POST', new LambdaIntegration(
      uploadAvatarLambdaConstruct.uploadAvatarLambda,
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
        'application/json': models!.uploadAvatarModel
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
