import {
  IResource,
  MockIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  HealthCheckApiConstructProps
} from '@interfaces/construct.interface';
import { HttpMethod } from '@enums/http-method.enum';
import { HttpStatusCode } from '@enums/http-status-code.enum';

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
   * Add the GET method to check api status
   *
   * @param resource - The API resource
   * @param methodResponses - The method responses
   */
  addMethod(
    resource: IResource
  ): void {
    resource.addMethod(HttpMethod.GET, new MockIntegration({
      integrationResponses: [{
        statusCode: `${HttpStatusCode.SUCCESS}`,
        responseTemplates: {
          'application/json': JSON.stringify({
            statusCode: HttpStatusCode.SUCCESS,
            message: 'API Gateway work well'
          })
        }
      }],
      requestTemplates: {
        'application/json': `{ "statusCode": ${HttpStatusCode.SUCCESS} }`
      },
    }), {
      methodResponses: [{ statusCode: `${HttpStatusCode.SUCCESS}` }],
      apiKeyRequired: false
    });
  }
}
