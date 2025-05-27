import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  RestApi,
  CognitoUserPoolsAuthorizer,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { UsersResourceConstruct } from '@constructs/api-gateway/users';
import { getLibrariesLayer } from '@shared/layer.helper';

// Mock libraries layer in Lambda
jest.mock('@shared/layer.helper', () => ({
  getLibrariesLayer: jest.fn().mockImplementation(() => ({}))
}));

describe('UsersResourceConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');
    const api = new RestApi(stack, 'Api');

    // Create Cognito User Pool
    const userPool = new UserPool(stack, 'UserPool');
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(
      stack,
      'CognitoAuthorization',
      {
        authorizerName: 'CognitoAuthorization',
        cognitoUserPools: [userPool],
      }
    );

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'lambda-layer');

    // Create Update User Model
    const updateUserModel = new Model(stack, 'UpdateUserModel', {
      restApi: api,
      modelName: 'UpdateUserModel',
      schema: {},
    });

    // Create Upload Avatar Model
    const uploadAvatarModel = new Model(stack, 'UploadAvatarModel', {
      restApi: api,
      modelName: 'UploadAvatarModel',
      schema: {},
    });

    // Create Presigned S3 Response Model
    const presignedS3ResponseModel = new Model(stack, 'PresignedS3ResponseModel', {
      restApi: api,
      modelName: 'PresignedS3ResponseModel',
      schema: {},
    });

    // Create Resource
    const resource = api.root.addResource('api');

    // Create Update User API
    new UsersResourceConstruct(stack, 'UsersResourceConstruct', {
      restApi: api,
      resource,
      librariesLayer,
      cognitoAuthorizer,
      models: {
        updateUserModel,
        uploadAvatarModel,
        presignedS3ResponseModel,
      },
    });

    template = Template.fromStack(stack);
  });

  it('should create exactly two API Gateway methods', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 2);
  });

  it('should create Lambda functions for API', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-update-user-dev',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-upload-avatar-dev',
    });
  });

  it('should create users resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'users',
    });
  });

  it('should create {userId} resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: '{userId}',
    });
  });

  it('should create avatar resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'avatar',
    });
  });

  it('should create models in API Gateway', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 3);
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UpdateUserModel',
    });
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'UploadAvatarModel',
    });
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'PresignedS3ResponseModel',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
