import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { ProductionPipelineStack } from '@pipelines/production.pipeline';

describe('TestProductionPipelineStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App({
      context: {
        github: {
          prod: {
            repositoryName: 'org/test-repo',
            branch: 'main'
          }
        }
      }
    });
    const stack = new ProductionPipelineStack(
      app,
      'TestProductionPipelineStack',
      {
        env: {
          account: '123456789012',
          region: 'us-east-1',
        },
        stage: {
          env: {
            account: '123456789012',
            region: 'us-east-1'
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
          },
        }
      }
    );

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
      Name: 'ecommerce-pipeline-prod',
    });
  });

  it('should include Route53Stack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-route53-stack');
  });

  it('should include CertificateStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-certificate-stack');
  });

  it('should include VpcStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-vpc-stack');
  });

  it('should include RdsStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-rds-stack');
  });

  it('should include StorageStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-storage-stack');
  });

  it('should include CloudFrontStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-cloudfront-stack');
  });

  it('should include QueueStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-queue-stack');
  });

  it('should include AuthStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-auth-stack');
  });

  it('should include ApiStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-api-stack');
  });

  it('should include EventBridgeStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-event-bridge-stack');
  });

  it('should include SnsStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-sns-stack');
  });

  it('should include MonitoringStack in the pipeline', () => {
    expectStackIncludedInPipeline('prod-monitoring-stack');
  });
});
