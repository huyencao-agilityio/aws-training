import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi,
  EndpointType,
  AuthorizationType,
  MockIntegration
} from 'aws-cdk-lib/aws-apigateway';

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create REST API
    this.api = new RestApi(this, 'EcommerceApi', {
      restApiName: 'Ecommerce API CDK',
      description: 'API for Ecommerce application',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      }
    });

    // Create API resources
    const apiResource = this.api.root.addResource('api');
    // Create health-check resource
    const healthCheck = apiResource.addResource('health-check');

    // Add health-check method
    healthCheck.addMethod('GET', new MockIntegration({
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
      methodResponses: [{ statusCode: '200' }],
      apiKeyRequired: false,
      authorizationType: AuthorizationType.NONE
    });
  }
}
