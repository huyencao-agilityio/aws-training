import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { Route53Stack } from '@stacks/route53.stack';

describe('TestRoute53Stack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new route53 stack
    const route53Stack = new Route53Stack(app, 'TestRoute53Stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    template = Template.fromStack(route53Stack);
  });

  it('should not create any hosted zone', () => {
    template.resourceCountIs('AWS::Route53::HostedZone', 0);
  });
});
