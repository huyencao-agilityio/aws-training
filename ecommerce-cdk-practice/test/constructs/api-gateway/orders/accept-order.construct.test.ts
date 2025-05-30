import { Stack, App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import {
  RestApi,
  CognitoUserPoolsAuthorizer,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import {
  AcceptOrderApiConstruct
} from '@constructs/api-gateway/orders/accept-order.construct';

describe('TestAcceptOrderApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App({});
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });
    const restApi = new RestApi(stack, 'TestRestApi');

    // Create Lambda Function
    const lambdaFunction = new NodejsFunction(stack, 'TestLambdaFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {}')
    });

    // Get user pool from existing user pool
    const userPool = UserPool.fromUserPoolId(
      stack,
      'TestFromUserPool',
      'TestUserPool'
    );
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(
      stack,
      'TestCognitoAuthorization',
      {
        authorizerName: 'TestCognitoAuthorization',
        cognitoUserPools: [userPool],
      }
    );

    // Create common response model
    const commonResponseModel = new Model(stack, 'TestCommonResponseModel', {
      restApi,
      modelName: 'TestCommonResponseModel',
      schema: {}
    });

    // Create Resource
    const resource = restApi.root
      .addResource('api')
      .addResource('orders')
      .addResource('{orderId}')
      .addResource('accept');

    // Create Accept Order API
    new AcceptOrderApiConstruct(stack, 'TestAcceptOrderApiConstruct', {
      restApi,
      resource,
      lambdaFunction,
      cognitoAuthorizer,
      models: {
        commonResponseModel,
      },
    });

    template = Template.fromStack(stack);
  });

  it('should create one API Gateway method', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  describe('Method Request', () => {
    it('should config method request with POST method', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'POST'
      });
    });

    it('should config method request with correct authorization', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        AuthorizationType: 'COGNITO_USER_POOLS',
        AuthorizationScopes: [
          'aws.cognito.signin.user.admin'
        ],
        ApiKeyRequired: false
      });
    });

    it('should config method request with parameters', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestParameters: {
          'method.request.path.orderId': true,
          'method.request.header.Authorization': true
        }
      });
    });
  });

  describe('Integration Request', () => {
    it('should config integration request with Lambda integration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          IntegrationHttpMethod: 'POST',
          Uri: Match.objectLike({
            'Fn::Join': Match.arrayWith([
              Match.arrayWith([
                Match.stringLikeRegexp(
                  ':apigateway:us-east-1:lambda:path/2015-03-31/functions/'
                ),
                Match.objectLike({
                  'Fn::GetAtt': Match.arrayWith([
                    Match.stringLikeRegexp('.*TestLambdaFunction.*'),
                    'Arn'
                  ])
                }),
              ])
            ])
          })
        }
      })
    });

    it('should config with correct integration request template', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          RequestTemplates: {
            'application/json': `{
              "context": {
                "sub": "$context.authorizer.claims.sub",
                "email": "$context.authorizer.claims.email",
                "group": "$context.authorizer.claims['cognito:groups']"
              },
              "orderId": "$input.params('orderId')",
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
            },
            {
              StatusCode: '403',
              SelectionPattern: '.*"statusCode":403.*',
              ResponseTemplates: responseTemplates
            },
            {
              StatusCode: '404',
              SelectionPattern: '.*"statusCode":404.*',
              ResponseTemplates: responseTemplates
            },
            {
              StatusCode: '401',
              SelectionPattern: '.*"statusCode":401.*',
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
                Ref: Match.stringLikeRegexp('.*TestCommonResponseModel.*')
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
          },
          {
            StatusCode: '403',
            ResponseModels: responseModelsErr
          },
          {
            StatusCode: '404',
            ResponseModels: responseModelsErr
          },
          {
            StatusCode: '401',
            ResponseModels: responseModelsErr
          }
        ]
      });
    });
  });
});
