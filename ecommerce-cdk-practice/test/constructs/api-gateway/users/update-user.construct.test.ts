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
  UpdateUsersDetailApiConstruct
} from '@constructs/api-gateway/users/update-user.construct';

describe('TestUpdateUserDetailApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });
    const api = new RestApi(stack, 'TestRestApi');

    // Create Lambda Function
    const lambdaFunction = new NodejsFunction(stack, 'TestLambdaFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {}'),
      functionName: 'ecommerce-api-update-user-dev'
    });

    // Get user pool from existing user pool
    const userPool = UserPool.fromUserPoolId(
      stack,
      'TestFromUserPool',
      'TestUserPool'
    );
    // Create Cognito authorizer
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(
      stack,
      'TestCognitoAuthorization',
      {
        authorizerName: 'CognitoAuthorization',
        cognitoUserPools: [userPool],
      }
    );

    // Create Update User Model
    const updateUserModel = new Model(stack, 'TestUpdateUserProfileModel', {
      restApi: api,
      modelName: 'TestUpdateUserProfileModel',
      schema: {}
    });

    // Create Resource
    const resource = api.root
      .addResource('api')
      .addResource('users')
      .addResource('{userId}');

    // Create Update User API
    new UpdateUsersDetailApiConstruct(
      stack,
      'TestUpdateUserDetailApiConstruct',
      {
        restApi: api,
        resource,
        lambdaFunction,
        cognitoAuthorizer,
        models: {
          updateUserModel,
        },
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create one API Gateway method', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  describe('Method Request', () => {
    it('should configure method request with PATCH method', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'PATCH'
      });
    });

    it('should configure method request with correct authorization', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        AuthorizationType: 'COGNITO_USER_POOLS',
        AuthorizationScopes: ['aws.cognito.signin.user.admin'],
        ApiKeyRequired: false
      });
    });

    it('should configure method request with parameters', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestParameters: {
          'method.request.path.userId': true,
          'method.request.header.Authorization': true
        }
      });
    });

    it('should configure method request with request model', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestModels: {
          'application/json': {
            Ref: Match.stringLikeRegexp('.*TestUpdateUserProfileModel.*')
          }
        }
      });
    });

    it('should configure method request validator body', () => {
      template.hasResourceProperties('AWS::ApiGateway::RequestValidator', {
        ValidateRequestBody: true
      });
    });
  });

  describe('Integration Request', () => {
    it('should configure integration request with Lambda integration', () => {
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

    it('should configure integration request with correct request template', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          RequestTemplates: {
            'application/json': `{
              "context": {
                "sub": "$context.authorizer.claims.sub",
                "email": "$context.authorizer.claims.email",
                "group": "$context.authorizer.claims['cognito:groups']"
              },
              "userId": "$input.params('userId')",
              "body": $input.json('$'),
            }`.replace(/\s+/g, ' ')
          }
        }
      });
    });
  });

  describe('Integration Response', () => {
    it('should configure integration response with correct status codes', () => {
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
              StatusCode: '409',
              SelectionPattern: '.*"statusCode":409.*',
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
                Ref: Match.stringLikeRegexp('.*TestUpdateUserProfileModel.*')
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
            StatusCode: '409',
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
