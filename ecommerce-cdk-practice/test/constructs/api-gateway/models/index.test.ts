import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import { ModelRestApiConstruct } from '@constructs/api-gateway/models';

describe('ModelRestApiConstruct', () => {
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

    new ModelRestApiConstruct(stack, 'ModelRestApiConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create six models', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 6);
  });

  it('should create a UpdateUserProfileModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UpdateUserProfileModel',
    });
  });

  it('should create a UploadAvatarModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UploadAvatarModel',
    });
  });

  it('should create a PresignedS3ResponseModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'PresignedS3ResponseModel',
    });
  });

  it('should create a OrderProductRequestModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'OrderProductRequestModel',
    });
  });

  it('should create a ProductsResponseModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'ProductsResponseModel',
    });
  });

  it('should create a CommonResponseModel', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'CommonResponseModel',
    });
  });

});
