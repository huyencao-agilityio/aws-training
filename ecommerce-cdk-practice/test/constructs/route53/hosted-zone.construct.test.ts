import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import 'dotenv/config';

import {
  HostedZoneConstruct
} from '@constructs/route53/hosted-zone.construct';

describe('HostedZoneConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestHostedZoneStack', {
      env: {
        account: process.env.AWS_ACCOUNT_ID,
        region: process.env.AWS_REGION
      }
    });
    new HostedZoneConstruct(stack, 'TestHostedZoneConstruct');

    template = Template.fromStack(stack);
  });

  it('should not create any CloudFormation resources', () => {
    template.resourceCountIs('AWS::Route53::HostedZone', 0);
  });
});
