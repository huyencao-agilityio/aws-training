import { Stack, App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import {
  RestApi,
  Model,
  RequestAuthorizer
} from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  GetProductsApiConstruct
} from '@constructs/api-gateway/products/get-products.construct';

describe('TestGetProductsApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const restApi = new RestApi(stack, 'TestRestApi');

    // Create Lambda Function
    const lambdaFunction = new NodejsFunction(stack, 'TestGetProductsLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {}')
    });

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

    // Create product model
    const productModel = new Model(stack, 'TestProductsResponseModel', {
      restApi,
      modelName: 'TestProductsResponseModel',
      schema: {}
    });

    // Create Resource
    const resource = restApi.root
      .addResource('api')
      .addResource('products')

    // Create Update User API
    new GetProductsApiConstruct(stack, 'TestGetProductsApiConstruct', {
      resource,
      lambdaFunction,
      lambdaAuthorizer,
      models: {
        productModel,
      },
    });

    template = Template.fromStack(stack);
  });

  it('should create one API Gateway method', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  describe('Method Request', () => {
    it('should config method request with GET method', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET'
      });
    });

    it('should config method request with correct authorization', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        AuthorizationType: 'CUSTOM',
        ApiKeyRequired: false
      });
    });

    it('should config method request with parameters', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestParameters: {
          'method.request.querystring.limit': false,
          'method.request.querystring.page': false,
          'method.request.header.Authorization': true
        }
      });
    });

    it('should config method request with request model', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestModels: {
          'application/json': {
            Ref: Match.stringLikeRegexp('.*TestProductsResponseModel.*')
          }
        }
      });
    });
  });

  describe('Integration Request', () => {
    it('should config integration request with Lambda integration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          IntegrationHttpMethod: 'POST',
          Uri: Match.anyValue()
        }
      })
    });

    it('should config integration request with correct request template', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          RequestTemplates: {
            'application/json': `{
              "requestContext": {
                "authorizer": {
                  "role": "$util.escapeJavaScript($context.authorizer.role)",
                  "principalId": "$util.escapeJavaScript($context.authorizer.principalId)",
                  "user": "$util.escapeJavaScript($context.authorizer.user)"
                }
              },
              "page": "$util.escapeJavaScript($input.params('page'))",
              "limit": "$util.escapeJavaScript($input.params('limit'))"
            }`.replace(/\s+/g, ' ')
          }
        }
      });
    });
  });

  describe('Integration Response', () => {
    it('should config integration response with correct status codes', () => {
      const responseTemplates = {
        'application/json':
          '#set($inputRoot = $input.path(\"$\"))\n' +
          '$inputRoot.errorMessage'
      };

      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          IntegrationResponses: [
            {
              StatusCode: '200'
            },
            {
              StatusCode: '400',
              SelectionPattern: '.*"statusCode":400.*',
              ResponseTemplates: responseTemplates
            },
            {
              StatusCode: '500',
              SelectionPattern: '.*"statusCode":500.*',
              ResponseTemplates: responseTemplates
            }
          ]
        }
      });
    });
  });

  describe('Method Response', () => {
    it('should include success and error response', () => {
      const responseModelsErr = {
        'application/json': 'Error'
      };

      template.hasResourceProperties('AWS::ApiGateway::Method', {
        MethodResponses: [
          {
            StatusCode: '200',
            ResponseModels: {
              'application/json': {
                Ref: Match.stringLikeRegexp('.*TestProductsResponseModel.*')
              }
            }
          },
          {
            StatusCode: '400',
            ResponseModels: responseModelsErr
          },
          {
            StatusCode: '500',
            ResponseModels: responseModelsErr
          }
        ]
      });
    });
  });
});
