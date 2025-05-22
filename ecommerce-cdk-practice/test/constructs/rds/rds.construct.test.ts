import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Vpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

import { PostgresRdsConstruct } from '@constructs/rds/rds.construct';

describe('PostgresRdsConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;
  let vpc: Vpc;
  let securityGroup: SecurityGroup;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestRdsStack');

    // Create VPC and Security Group for testing
    vpc = new Vpc(stack, 'TestVpc');
    securityGroup = new SecurityGroup(stack, 'TestSecurityGroup', {
      vpc,
      description: 'Test security group for RDS'
    });

    new PostgresRdsConstruct(stack, 'TestRdsConstruct', {
      vpc,
      securityGroup
    });

    template = Template.fromStack(stack);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      DBSubnetGroupName: Match.anyValue(),
      VPCSecurityGroups: Match.arrayWith([
        Match.objectLike({
          'Fn::GetAtt': [
            Match.stringLikeRegexp('TestSecurityGroup'),
            'GroupId'
          ]
        })
      ])
    });
  });

  it('should have correct removal policy', () => {
    template.hasResource('AWS::RDS::DBInstance', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain'
    });
  });
});
