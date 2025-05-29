import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import {
  HostedZoneConstruct
} from '@constructs/route53/hosted-zone.construct';

describe('TestHostedZoneConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });
    new HostedZoneConstruct(stack, 'TestHostedZoneConstruct');

    template = Template.fromStack(stack);
  });

  it('should not create any CloudFormation resources', () => {
    template.resourceCountIs('AWS::Route53::HostedZone', 0);
  });
});
