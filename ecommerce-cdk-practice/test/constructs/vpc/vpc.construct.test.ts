import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { VpcConstruct } from '@constructs/vpc/vpc.construct';

describe('TestVpcConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Create VPC Construct
    new VpcConstruct(stack, 'TestVpcConstruct');

    template = Template.fromStack(stack);
  });

  it('should create a VPC', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  it('should create a VPC with  correct name format', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      Tags: Match.arrayWith([
        Match.objectLike({
          Key: 'Name',
          Value: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
        }),
      ])
    });
  });

  it('should configure VPC with CIDR 10.0.0.0/16', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
    });
  });

  it('should enable DNS support and hostnames', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      EnableDnsSupport: true,
      EnableDnsHostnames: true,
    });
  });

  it('should create 2 public and 2 private subnets', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 4);

    // Test public subnets
    template.hasResourceProperties('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: true,
      CidrBlock: Match.stringLikeRegexp('^10\\.0\\.\\d+\\.0/24$'),
      Tags: Match.arrayWith([
        Match.objectLike({
          Key: 'aws-cdk:subnet-name',
          Value: 'PublicSubnet',
        }),
        Match.objectLike({
          Key: 'aws-cdk:subnet-type',
          Value: 'Public',
        }),
      ]),
    });

    // Test private subnets
    template.hasResourceProperties('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: false,
      CidrBlock: Match.stringLikeRegexp('^10\\.0\\.\\d+\\.0/24$'),
      Tags: Match.arrayWith([
        Match.objectLike({
          Key: 'aws-cdk:subnet-name',
          Value: 'PrivateSubnet',
        }),
        Match.objectLike({
          Key: 'aws-cdk:subnet-type',
          Value: 'Isolated',
        }),
      ]),
    });
  });

  it('should create a Security Group', () => {
    template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
  });

  it('should create a Security Group with the correct name format', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupName: Match.stringLikeRegexp('^ecommerce-.*-dev$')
    });
  });

  it('should allow all outbound traffic in Security Group', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({
          CidrIp: '0.0.0.0/0',
          IpProtocol: '-1',
          Description: 'Allow all outbound traffic by default'
        })
      ])
    });
  });

  it('should allow all TCP traffic from anywhere in Security Group', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: Match.arrayWith([
        Match.objectLike({
          IpProtocol: 'tcp',
          FromPort: 0,
          ToPort: 65535,
          CidrIp: '0.0.0.0/0',
          Description: 'Allow all TCP traffic from anywhere'
        })
      ])
    });
  });

  it('should allow all traffic from self in Security Group', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: '-1',
      Description: 'Allow all traffic from self',
      SourceSecurityGroupId: Match.anyValue()
    });
  });
});
