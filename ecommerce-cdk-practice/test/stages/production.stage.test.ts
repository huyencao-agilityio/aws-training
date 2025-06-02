import { App, Stage } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';

import { ProductionStage } from '@stages/production.stage';

describe('TestProductionStage', () => {
  let stage: Stage;
  let stacks: Stack[];

  beforeAll(() => {
    const app = new App();
    stage = new ProductionStage(app, 'TestProdStage', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stageName: 'prod',
      services: {
        apiGateway: {
          domainName: 'api.ecommerce-app.click',
          basePathApi: 'v1',
          stage: 'v1',
        },
        cloudFront: {
          domainName: 'cdn.ecommerce-app.click',
        },
        cognito: {
          domainName: 'auth.ecommerce-app.click',
        },
      }

    });

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
      'prod-route53-stack',
      'AWS::Route53::HostedZone',
      0
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'prod-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include CertificateStack defined', () => {
    expectStackWithResource(
      'prod-certificate-stack',
      'AWS::CertificateManager::Certificate',
      1
    );
  });

  it('should include VPCStack defined', () => {
    expectStackWithResource('prod-vpc-stack', 'AWS::EC2::VPC', 1);
  });

  it('should include RDSStack defined', () => {
    expectStackWithResource('prod-rds-stack', 'AWS::RDS::DBInstance', 1);
  });

  it('should include StorageStack defined', () => {
    expectStackWithResource('prod-storage-stack', 'AWS::S3::Bucket', 1);
  });

  it('should include CloudFrontStack defined', () => {
    expectStackWithResource(
      'prod-cloudfront-stack',
      'AWS::CloudFront::Distribution',
      1
    );
  });

  it('should include QueueStack defined', () => {
    expectStackWithResource('prod-queue-stack', 'AWS::SQS::Queue', 6);
  });

  it('should include AuthStack defined', () => {
    expectStackWithResource('prod-auth-stack', 'AWS::Cognito::UserPool', 1);
  });

  it('should include ApiStack defined', () => {
    expectStackWithResource('prod-api-stack', 'AWS::ApiGateway::RestApi', 1);
  });

  it('should include EventBridgeStack defined', () => {
    expectStackWithResource(
      'prod-event-bridge-stack',
      'AWS::Scheduler::Schedule',
      1
    );
  });

  it('should include SnsStack defined', () => {
    expectStackWithResource('prod-sns-stack', 'AWS::SNS::Topic', 1);
  });

  it('should include MonitoringStack defined', () => {
    expectStackWithResource(
      'prod-monitoring-stack',
      'AWS::CloudWatch::Alarm',
      1
    );
  });
});
