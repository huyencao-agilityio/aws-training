import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import {
  RestApiConstruct
} from '@constructs/api-gateway/rest-api.construct';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestRestApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    const userPool = UserPool.fromUserPoolId(
      stack,
      'TestFromUserPool',
      'TestUserPool'
    );

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'test-lambda-layer');

    new RestApiConstruct(stack, 'TestRestApiConstruct', {
      userPool,
      librariesLayer,
      stage: 'v1'
    });

    template = Template.fromStack(stack);
  });

  it('should create a rest api', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  it('should create a stage in the rest api', () => {
    template.resourceCountIs('AWS::ApiGateway::Stage', 1);
  });

  it('should create two authorizers in the rest api', () => {
    template.resourceCountIs('AWS::ApiGateway::Authorizer', 2);
  });

  it('should have total 10 resources', () => {
    template.resourceCountIs('AWS::ApiGateway::Resource', 10);
  });

  it('should have total 6 models', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 6);
  });

  it('should create a Rest API with config', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Description: 'API for Ecommerce application',
      EndpointConfiguration: {
        Types: [
          'REGIONAL'
        ]
      },
      Name: 'ecommerce-api-dev'
    });
  });

  it('should create stage with name', () => {
    template.hasResourceProperties('AWS::ApiGateway::Stage', {
      StageName: 'v1'
    });
  });

  it('should create a Cognito authorizer with name', () => {
    template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
      Name: 'CognitoAuthorization'
    });
  });

  it('should create a Lambda authorizer with name', () => {
    template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
      Name: 'LambdaAuthorization'
    });
  });

  it('should create resource with path name api', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'api'
    });
  });
});
