import { App, Stage } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';

import { DevStage } from '@stages/dev.stage';

describe('TestDevStage', () => {
  let stage: Stage;
  let stacks: Stack[];

  beforeAll(() => {
    const app = new App();
    stage = new DevStage(app, 'TestDevStage', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stageName: 'dev',
      services: {
        apiGateway: {
          domainName: 'api-dev.ecommerce-app.click',
          basePathApi: 'v1',
          stage: 'v1',
        },
        cloudFront: {
          domainName: 'cdn-dev.ecommerce-app.click',
        },
        cognito: {
          domainName: 'auth-dev.ecommerce-app.click',
        },
      }

    });

    // Get all stacks in the stage
    stacks = stage.node.findAll().filter(
      item => item instanceof Stack
    ) as Stack[];
  });

  /**
   * Helper function to check if a stack has a specific resource
   *
   * @param stackName - The name of the stack
   * @param resourceType - The type of the resource
   * @param resourceCount - The number of resources
   */
  const expectStackWithResource = (
    stackName: string,
    resourceType: string,
    resourceCount: number
  ) => {
    const stack = stacks.find(s => s.stackName === stackName);

    expect(stack).toBeDefined();

    const template = Template.fromStack(stack!);

    template.resourceCountIs(resourceType, resourceCount)
  };

  it('should include Route53Stack defined', () => {
    expectStackWithResource(
      'dev-route53-stack',
      'AWS::Route53::HostedZone',
      0
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'dev-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'dev-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include VPCStack defined', () => {
    expectStackWithResource('dev-vpc-stack', 'AWS::EC2::VPC', 1);
  });

  it('should include RDSStack defined', () => {
    expectStackWithResource('dev-rds-stack', 'AWS::RDS::DBInstance', 1);
  });

  it('should include StorageStack defined', () => {
    expectStackWithResource('dev-storage-stack', 'AWS::S3::Bucket', 1);
  });

  it('should include CloudFrontStack defined', () => {
    expectStackWithResource(
      'dev-cloudfront-stack',
      'AWS::CloudFront::Distribution',
      1
    );
  });

  it('should include QueueStack defined', () => {
    expectStackWithResource('dev-queue-stack', 'AWS::SQS::Queue', 6);
  });

  it('should include AuthStack defined', () => {
    expectStackWithResource('dev-auth-stack', 'AWS::Cognito::UserPool', 1);
  });

  it('should include ApiStack defined', () => {
    expectStackWithResource('dev-api-stack', 'AWS::ApiGateway::RestApi', 1);
  });

  it('should include EventBridgeStack defined', () => {
    expectStackWithResource(
      'dev-event-bridge-stack',
      'AWS::Scheduler::Schedule',
      1
    );
  });

  it('should include SnsStack defined', () => {
    expectStackWithResource('dev-sns-stack', 'AWS::SNS::Topic', 1);
  });

  it('should include MonitoringStack defined', () => {
    expectStackWithResource(
      'dev-monitoring-stack',
      'AWS::CloudWatch::Alarm',
      1
    );
  });
});
