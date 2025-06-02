import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { StagingPipelineStack } from '@pipelines/staging.pipeline';

describe('TestStagingPipelineStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App({
      context: {
        github: {
          staging: {
            repositoryName: 'org/test-repo',
            branch: 'develop'
          }
        }
      }
    });
    const stack = new StagingPipelineStack(app, 'TestStagingPipelineStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stage: {
        env: {
          account: '123456789012',
          region: 'us-east-1'
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
        },
      }
    });

    template = Template.fromStack(stack);
  });

  // Helper function to check if a stack is included in the pipeline
  const expectStackIncludedInPipeline = (stackName: string) => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Stages: Match.arrayWith([
        Match.objectLike({
          Actions: Match.arrayWith([
            Match.objectLike({
              Configuration: Match.objectLike({
                StackName: stackName,
              }),
            }),
          ]),
        }),
      ]),
    });
  };

  it('should create one Pipeline', () => {
    template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
  });

  it('should have name as expected', () => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Name: 'ecommerce-pipeline-staging',
    });
  });

  it('should include Route53Stack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-route53-stack');
  });

  it('should include CertificateStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-certificate-stack');
  });

  it('should include VpcStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-vpc-stack');
  });

  it('should include RdsStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-rds-stack');
  });

  it('should include StorageStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-storage-stack');
  });

  it('should include CloudFrontStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-cloudfront-stack');
  });

  it('should include QueueStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-queue-stack');
  });

  it('should include AuthStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-auth-stack');
  });

  it('should include ApiStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-api-stack');
  });

  it('should include EventBridgeStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-event-bridge-stack');
  });

  it('should include SnsStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-sns-stack');
  });

  it('should include MonitoringStack in the pipeline', () => {
    expectStackIncludedInPipeline('staging-monitoring-stack');
  });
});
