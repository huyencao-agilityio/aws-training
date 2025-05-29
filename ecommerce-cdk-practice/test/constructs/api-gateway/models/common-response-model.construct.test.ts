import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  CommonResponseModelConstruct
} from '@constructs/api-gateway/models/common-response-model.construct';

describe('TestCommonResponseModelConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const restApi = new RestApi(stack, 'TestRestApi');

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    // Create common response model construct
    new CommonResponseModelConstruct(stack, 'TestCommonResponseConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create one model', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 1);
  });

  it('should create a CommonResponseModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'CommonResponseModel',
      ContentType: 'application/json',
      Description: 'Standard response model for successful API operations',
      Schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
      },
    });
  });
});
