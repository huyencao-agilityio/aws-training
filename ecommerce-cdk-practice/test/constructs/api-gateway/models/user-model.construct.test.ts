import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  UserModelConstruct
} from '@constructs/api-gateway/models/user-model.construct';

describe('TestUserModelConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const restApi = new RestApi(stack, 'TestRestApi');

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    new UserModelConstruct(stack, 'TestUserModelConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create one model', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 1);
  });

  it('should create a ProductsResponseModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UpdateUserProfileModel',
      ContentType: 'application/json',
      Description: 'This model defines the fields to a user',
      Schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          name: {
            type: 'string'
          },
          address: {
            type: 'string'
          }
        }
      }
    });
  });
});
