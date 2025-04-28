import {
  AuthorizationType,
  IAuthorizer,
  MockIntegration,
  Resource
} from 'aws-cdk-lib/aws-apigateway';

/**
 * Configures the GET /health-check-lambda endpoint.
 *
 * @param healthCheckResource - The API resource to attach the method to
 * @param authorizerLambda - Authorizer for the endpoint
 */
export const healthCheckLambdaMethod = (
  healthCheckResource: Resource,
  authorizer: IAuthorizer
): void => {

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
    authorizationType: AuthorizationType.CUSTOM
  });
};
