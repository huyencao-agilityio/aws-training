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
  OrderLambdaConstruct
} from '../../lambda/api-gateway/orders.construct';

/**
 * Define the construct for API POST accept order
 */
export class AcceptOrderApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    // Create the Lambda function for accept order
    const acceptOrderLambdaConstruct = new OrderLambdaConstruct(
      this,
      'AcceptOrderLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Define the list error code that need to handle in API
    const errorStatusCodes = [403, 404, 400, 500];
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
          'application/json': models!.commonResponseModel,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];

    // Add the POST method to the API resource to order product
    // This creates the POST /orders endpoint
    resource.addMethod('POST', new LambdaIntegration(
      acceptOrderLambdaConstruct.acceptOrderLambda,
      {
        proxy: false,
        requestTemplates: {
          'application/json': `{
            "orderId": "$input.params('orderId')",
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
      authorizer: cognitoAuthorizer,
      authorizationScopes: [
        'aws.cognito.signin.user.admin',
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
