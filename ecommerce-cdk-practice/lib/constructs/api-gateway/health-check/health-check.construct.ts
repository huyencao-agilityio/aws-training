import {
  IResource,
  MockIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  HealthCheckApiConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct for API health-check
 */
export class HealthCheckApiConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: HealthCheckApiConstructProps
  ) {
    super(scope, id);

    const { resource } = props;

    // Add health-check method
    // This creates the GET /health-check endpoint
    this.addMethod(resource);
  }

  /**
   * Add the GET method to the API resource
   *
   * @param resource - The API resource
   * @param methodResponses - The method responses
   */
  addMethod(
    resource: IResource
  ): void {
    resource.addMethod('GET', new MockIntegration({
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
      apiKeyRequired: false
    });
  }
}
