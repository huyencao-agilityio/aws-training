import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { VPCStack } from '@stacks/vpc.stack';

describe('TestVPCStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new vpc stack
    const vpcStack = new VPCStack(app, 'TestVPCStack', {});

    template = Template.fromStack(vpcStack);
  });

  it('should create a VPC', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  it('should create a Security Group', () => {
    template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
  });

  it('should create 2 public and 2 private subnets', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 4);
  });
});
