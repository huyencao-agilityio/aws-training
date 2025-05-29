import { App, Stack } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  HealthCheckResourceConstruct
} from '@constructs/api-gateway/health-check';

describe('TestHealthCheckResourceConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const api = new RestApi(stack, 'TestRestApi');

    new HealthCheckResourceConstruct(
      stack,
      'TestHealthCheckResourceConstruct',
      {
        resource: api.root,
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create one API Gateway method', () => {
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
  });

  it('should create health-check resource', () => {
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'health-check',
    });
  });
});
