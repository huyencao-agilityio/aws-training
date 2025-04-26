import {
  AuthorizationType,
  IAuthorizer,
  MockIntegration,
  Resource
} from 'aws-cdk-lib/aws-apigateway';

export const healthCheckLambdaMethod = (
  healthCheckResource: Resource,
  authorizerLambda: IAuthorizer
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
    authorizer: authorizerLambda,
    methodResponses: [{ statusCode: '200' }],
    apiKeyRequired: false,
    authorizationType: AuthorizationType.CUSTOM
  });
};
