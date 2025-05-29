import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  UploadAvatarModelConstruct
} from '@constructs/api-gateway/models/upload-avatar-model.construct';

describe('TestUploadAvatarModelConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const restApi = new RestApi(stack, 'TestRestApi');

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    new UploadAvatarModelConstruct(stack, 'TestUploadAvatarModelConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create two models', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 2);
  });

  it('should create a UploadAvatarModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UploadAvatarModel',
      ContentType: 'application/json',
      Description: 'This model defines the fields' +
        'when user upload their avatar',
      Schema: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            enum: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
          }
        }
      }
    });
  });

  it('should create a PresignedS3ResponseModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'PresignedS3ResponseModel',
      ContentType: 'application/json',
      Description: 'This model defines the standard structure of a response' +
        'containing a presigned S3',
      Schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string'
          },
          fields: {
            type: 'object',
            properties: {
              'Content-Type': {
                type: 'string'
              },
              'x-amz-meta-user-id': {
                type: 'string'
              },
              bucket: {
                type: 'string'
              },
              'X-Amz-Algorithm': {
                type: 'string'
              },
              'X-Amz-Credential': {
                type: 'string'
              },
              'X-Amz-Date': {
                type: 'string'
              },
              'X-Amz-Security-Token': {
                type: 'string'
              },
              key: {
                type: 'string'
              },
              Policy: {
                type: 'string'
              },
              'X-Amz-Signature': {
                type: 'string'
              }
            }
          }
        }
      }
    });
  });
});
