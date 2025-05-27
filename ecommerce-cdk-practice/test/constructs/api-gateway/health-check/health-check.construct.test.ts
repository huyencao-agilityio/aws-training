import { App, Stack } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  HealthCheckApiConstruct
} from '@constructs/api-gateway/health-check/health-check.construct';

describe('HealthCheckApiConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');
    const api = new RestApi(stack, 'Api');

    // Add a resource for the health check
    const resource = api.root.addResource('health-check');

    // Add the health check construct
    new HealthCheckApiConstruct(stack, 'HealthCheckConstruct', {
      resource,
    });

    template = Template.fromStack(stack);
  });

  it('should create exactly one API Gateway method', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  describe('Method Request', () => {
    it('should configure method request with GET method', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET'
      });
    });
  });

  describe('Integration Request', () => {
    it('should config integration request with type is MOCK', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          Type: 'MOCK'
        }
      });
    });

    it('should config correct integration request template', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          RequestTemplates: {
            'application/json': '{ \"statusCode\": 200 }'
          }
        }
      });
    });
  });

  describe('Integration Response', () => {
    it('should config integration response with correct status code', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          IntegrationResponses: [
            {
              ResponseTemplates: {
              'application/json':
                '{\"statusCode\":200,\"message\":\"API Gateway work well\"}'
            },
              StatusCode: '200'
            }
          ]
        }
      });
    });
  });

  describe('Method Response', () => {
    it('should config method response with correct status code', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        MethodResponses: [{ StatusCode: '200' }]
      });
    });
  });
});
