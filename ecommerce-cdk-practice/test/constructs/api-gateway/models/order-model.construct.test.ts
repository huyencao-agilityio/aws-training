import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  OrderModelConstruct
} from '@constructs/api-gateway/models/order-model.construct';

describe('OrderModelConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');
    const restApi = new RestApi(stack, 'RestApi', {
      restApiName: 'RestApi',
    });

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    new OrderModelConstruct(stack, 'OrderModelConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create one model', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 1);
  });

  it('should create a OrderProductRequestModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'OrderProductRequestModel',
      ContentType: 'application/json',
      Description: 'This model defines the format data' +
        'for body request when user order product',
      Schema: {
      type: 'object',
      properties: {
        cartItemIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid'
          },
          minItems: 1
        }
        },
        required: ['cartItemIds'],
        minItems: 1
      }
    });
  });
});
