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
  UploadAvatarApiConstruct
} from '@constructs/api-gateway/users/upload-avatar.construct';

describe('TestUploadAvatarApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
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
      code: Code.fromInline('exports.handler = async () => {}'),
      functionName: 'ecommerce-api-upload-avatar-dev'
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
      'CognitoAuthorization',
      {
        authorizerName: 'CognitoAuthorization',
        cognitoUserPools: [userPool],
      }
    );

    // Create Upload Avatar Model
    const uploadAvatarModel = new Model(stack, 'TestUploadAvatarModel', {
      restApi,
      modelName: 'TestUploadAvatarModel',
      schema: {}
    });

    // Create Presigned S3 Response Model
    const presignedS3ResponseModel = new Model(
      stack,
      'TestPresignedS3ResponseModel',
      {
        restApi,
        modelName: 'TestPresignedS3ResponseModel',
        schema: {}
      }
    );

    // Create Resource
    const resource = restApi.root
      .addResource('api')
      .addResource('users')
      .addResource('{userId}')
      .addResource('avatar');

    // Create Upload Avatar API
    new UploadAvatarApiConstruct(stack, 'TestUploadAvatarApiConstruct', {
      restApi,
      resource,
      lambdaFunction,
      cognitoAuthorizer,
      models: {
        uploadAvatarModel,
        presignedS3ResponseModel,
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
        AuthorizationScopes: ['aws.cognito.signin.user.admin'],
        ApiKeyRequired: false
      });
    });

    it('should config method request with parameters', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestParameters: {
          'method.request.path.userId': true,
          'method.request.header.Authorization': true
        }
      });
    });

    it('should config method request with request model', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        RequestModels: {
          'application/json': {
            Ref: Match.stringLikeRegexp('.*TestUploadAvatarModel.*')
          }
        }
      });
    });

    it('should config method request validator body', () => {
      template.hasResourceProperties('AWS::ApiGateway::RequestValidator', {
        ValidateRequestBody: true
      });
    });
  });

  describe('Integration Request', () => {
    it('should config integration request with a Lambda function', () => {
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

    it('should config request template in integration request', () => {
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
              StatusCode: '401',
              SelectionPattern: '.*"statusCode":401.*',
              ResponseTemplates: responseTemplates
            },
            {
              StatusCode: '403',
              SelectionPattern: '.*"statusCode":403.*',
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
                Ref: Match.stringLikeRegexp('.*TestPresignedS3ResponseModel.*')
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
            StatusCode: '401',
            ResponseModels: responseModelsErr
          },
          {
            StatusCode: '403',
            ResponseModels: responseModelsErr
          }
        ]
      });
    });
  });
});
