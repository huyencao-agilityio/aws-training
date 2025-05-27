import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  RestApi,
  CognitoUserPoolsAuthorizer,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { getLibrariesLayer } from '@shared/layer.helper';
import {
  OrderProductResourceConstruct
} from '@constructs/api-gateway/orders';

// Mock libraries layer in Lambda
jest.mock('@shared/layer.helper', () => ({
  getLibrariesLayer: jest.fn().mockImplementation(() => ({}))
}));

describe('OrderProductResourceConstruct', () => {
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

    // Create common response model
    const commonResponseModel = new Model(stack, 'CommonResponseModel', {
      restApi: api,
      modelName: 'CommonResponseModel',
      schema: {}
    });

    // Create order model
    const orderModel = new Model(stack, 'OrderModel', {
      restApi: api,
      modelName: 'OrderModel',
      schema: {}
    });

    // Create Resource
    const resource = api.root.addResource('api');

    // Create order product resource
    new OrderProductResourceConstruct(stack, 'OrderProductResourceConstruct', {
      restApi: api,
      resource,
      librariesLayer,
      cognitoAuthorizer,
      models: {
        orderModel,
        commonResponseModel,
      },
    });

    template = Template.fromStack(stack);
  });

  it('should create three API Gateway methods', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 3);
  });

  it('should create Lambda functions for API', () => {
    template.resourceCountIs('AWS::Lambda::Function', 3);

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-order-product-dev',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-accept-order-dev',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-reject-order-dev',
    });
  });

  it('should create orders resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'orders',
    });
  });

  it('should create {orderId} resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: '{orderId}',
    });
  });

  it('should create accept resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'accept',
    });
  });

  it('should create reject resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'reject',
    });
  });

  it('should create models in API Gateway', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 2);
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'OrderModel',
    });
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'CommonResponseModel',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
