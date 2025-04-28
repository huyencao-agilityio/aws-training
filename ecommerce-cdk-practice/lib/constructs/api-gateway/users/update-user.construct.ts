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


import { RestApiResourceConstructProps } from '@interfaces/construct-props.interface';
import { UpdateUserLambdaConstruct } from '../../lambda/api-gateway/update-user.construct';

/**
 * Define the construct for API PATCH update user detail
 */
export class UpdateUsersDetailConstruct extends Construct {
  public readonly updateUserLambdaConstruct: Resource;

  constructor(scope: Construct, id: string, props: RestApiResourceConstructProps<IModel>) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, model } = props;

    // Create the Lambda function for product retrieval
    const updateUserLambdaConstruct = new UpdateUserLambdaConstruct(
      scope, 'GetProductsLambdaConstruct',
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
          'application/json': model,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];

    // Add the GET method to the API resource
    // This creates the GET /products endpoint
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
        'application/json': model
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
