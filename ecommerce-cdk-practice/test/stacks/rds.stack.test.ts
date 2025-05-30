import { App, Fn, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

import { RdsStack } from '@stacks/rds.stack';

describe('TestRdsStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    // Get VPC and Security Group
    const vpc = Vpc.fromLookup(stack, 'TestVpc', {
      vpcId: 'vpc-id'
    });
    const securityGroup = SecurityGroup.fromSecurityGroupId(
      stack,
      'TestSecurityGroup',
      Fn.importValue('TestSecurityGroupId')
    );

    // Create new rds stack
    const rdsStack = new RdsStack(
      app,
      'TestRdsStack',
      {
        vpc,
        securityGroup
      }
    );

    template = Template.fromStack(rdsStack);
  });

  it('should create an RDS instance', () => {
    template.resourceCountIs('AWS::RDS::DBInstance', 1);
  });

  it('should create output for Db Host', () => {
    template.hasOutput('DbHost', {
      Export: {
        Name: 'DbHost'
      },
      'Value': {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('.*PostgresRdsConstruct.*'),
          'Endpoint.Address'
        ]
      },
    });
  });
});
