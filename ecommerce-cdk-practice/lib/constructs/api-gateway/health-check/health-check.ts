import {
  AuthorizationType,
  IAuthorizer,
  MockIntegration,
  Resource
} from 'aws-cdk-lib/aws-apigateway';

/**
 * Configures the GET /health-check endpoint
 *
 * @param healthCheckResource - The API resource to attach the method to
 * @param authorizer - The Cognito authorizer for request validation
 */
export const healthCheckMethod = (
  healthCheckResource: Resource,
  authorizer: IAuthorizer
): void => {

  // Add health-check method
  healthCheckResource.addMethod('GET', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseTemplates: {
        'application/json': JSON.stringify({
          statusCode: 200,
          message: 'API Gateway work well'
        })
      }
    }],
    requestTemplates: {
      'application/json': '{ "statusCode": 200 }'
    },
  }), {
    authorizer: authorizer,
    methodResponses: [{ statusCode: '200' }],
    apiKeyRequired: false,
    authorizationType: AuthorizationType.COGNITO
  });
};
