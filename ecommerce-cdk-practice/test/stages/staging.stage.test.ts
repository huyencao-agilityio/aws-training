import { App, Stage } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';

import { StagingStage } from '@stages/staging.stage';

describe('TestStagingStage', () => {
  let stage: Stage;
  let stacks: Stack[];

  beforeAll(() => {
    const app = new App();
    stage = new StagingStage(app, 'TestStagingStage', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stageName: 'staging',
      services: {
        apiGateway: {
          domainName: 'api-staging.ecommerce-app.click',
          basePathApi: 'v1',
          stage: 'v1',
        },
        cloudFront: {
          domainName: 'cdn-staging.ecommerce-app.click',
        },
        cognito: {
          domainName: 'auth-staging.ecommerce-app.click',
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
      'staging-route53-stack',
      'AWS::Route53::HostedZone',
      0
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'staging-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'staging-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include VPCStack defined', () => {
    expectStackWithResource('staging-vpc-stack', 'AWS::EC2::VPC', 1);
  });

  it('should include RDSStack defined', () => {
    expectStackWithResource('staging-rds-stack', 'AWS::RDS::DBInstance', 1);
  });

  it('should include StorageStack defined', () => {
    expectStackWithResource('staging-storage-stack', 'AWS::S3::Bucket', 1);
  });

  it('should include CloudFrontStack defined', () => {
    expectStackWithResource(
      'staging-cloudfront-stack',
      'AWS::CloudFront::Distribution',
      1
    );
  });

  it('should include QueueStack defined', () => {
    expectStackWithResource('staging-queue-stack', 'AWS::SQS::Queue', 6);
  });

  it('should include AuthStack defined', () => {
    expectStackWithResource(
      'staging-auth-stack',
      'AWS::Cognito::UserPool',
      1
    );
  });

  it('should include ApiStack defined', () => {
    expectStackWithResource(
      'staging-api-stack',
      'AWS::ApiGateway::RestApi',
      1
    );
  });

  it('should include EventBridgeStack defined', () => {
    expectStackWithResource(
      'staging-event-bridge-stack',
      'AWS::Scheduler::Schedule',
      1
    );
  });

  it('should include SnsStack defined', () => {
    expectStackWithResource(
      'staging-sns-stack',
      'AWS::SNS::Topic',
      1
    );
  });

  it('should include MonitoringStack defined', () => {
    expectStackWithResource(
      'staging-monitoring-stack',
      'AWS::CloudWatch::Alarm',
      1
    );
  });
});
