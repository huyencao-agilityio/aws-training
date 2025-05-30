import { App, Fn, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Vpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

import { PostgresRdsConstruct } from '@constructs/rds/rds.construct';

describe('PostgresRdsConstruct', () => {
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

    new PostgresRdsConstruct(stack, 'TestRdsConstruct', {
      vpc,
      securityGroup
    });

    template = Template.fromStack(stack);
  });

  it('should create an RDS instance', () => {
    template.resourceCountIs('AWS::RDS::DBInstance', 1);
  });

  it('should create instance with correct configuration', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', {
      Engine: 'postgres',
      EngineVersion: Match.stringLikeRegexp('^17'),
      DBInstanceClass: 'db.t3.micro',
      AllocatedStorage: '20',
      StorageType: 'gp2',
      MultiAZ: false,
      PubliclyAccessible: true,
      StorageEncrypted: true,
      EnablePerformanceInsights: true,
      DeletionProtection: false,
      DeleteAutomatedBackups: true,
      BackupRetentionPeriod: 0,
      MasterUsername: 'postgres',
      MasterUserPassword: Match.anyValue(),
      DBInstanceIdentifier: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
    });
  });

  it('should have correct VPC configuration', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', {
      DBSubnetGroupName: {
        Ref: Match.stringLikeRegexp('.*TestRdsConstruct.*')
      },
      VPCSecurityGroups: [{
        'Fn::ImportValue': Match.stringLikeRegexp('.*TestSecurityGroupId.*')
      }]
    });
  });

  it('should have correct removal policy', () => {
    template.hasResource('AWS::RDS::DBInstance', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain'
    });
  });
});
