import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  RestApi,
  Model,
  RequestAuthorizer
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Code } from 'aws-cdk-lib/aws-lambda';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { getLibrariesLayer } from '@shared/layer.helper';
import { ProductsResourceConstruct } from '@constructs/api-gateway/products';

// Mock libraries layer in Lambda
jest.mock('@shared/layer.helper', () => ({
  getLibrariesLayer: jest.fn().mockImplementation(() => ({}))
}));

describe('TestProductsResourceConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const restApi = new RestApi(stack, 'TestRestApi');

    // Create Lambda Function Authorizer
    const lambdaFunctionAuthorizer = new NodejsFunction(
      stack,
      'TestLambdaFunctionAuthorizer',
      {
        handler: 'index.handler',
        code: Code.fromInline('exports.handler = async () => {}')
      }
    );
    const lambdaAuthorizer = new RequestAuthorizer(
      stack,
      'TestLambdaAuthorizer',
      {
        handler: lambdaFunctionAuthorizer,
        identitySources: ['method.request.header.Authorization'],
      }
    );

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'test-lambda-layer');

    // Create product model
    const productModel = new Model(stack, 'TestProductsResponseModel', {
      restApi,
      modelName: 'TestProductsResponseModel',
      schema: {}
    });

    // Get user pool from existing user pool
    const userPool = UserPool.fromUserPoolId(
      stack,
      'TestFromUserPool',
      'TestUserPool'
    );

    // Create Resource
    const resource = restApi.root.addResource('api');

    // Create Update User API
    new ProductsResourceConstruct(stack, 'TestProductsResourceConstruct', {
      resource,
      userPool,
      librariesLayer,
      lambdaAuthorizer,
      models: {
        productModel,
      },
    });

    template = Template.fromStack(stack);
  });

  it('should create one API Gateway methods', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  it('should create Lambda functions for API', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-get-products-dev',
    });
  });

  it('should create products resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'products',
    });
  });

  it('should create models in API Gateway', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 1);
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'TestProductsResponseModel',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
