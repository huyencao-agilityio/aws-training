import { App, Stack, Token } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Topic } from 'aws-cdk-lib/aws-sns';

import { MonitoringStack } from '@stacks/monitoring.stack';

describe('TestMonitoringStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Get SNS Topic from existing topic
    const snsTopic = Topic.fromTopicArn(
      stack,
      'TestFromTopic',
      Token.asString({
        'Fn::ImportValue': 'arn:aws:sns:us-east-1:123456789012:TestTopic'
      })
    );

    // Create new monitoring stack
    const monitoringStack = new MonitoringStack(
      app,
      'TestMonitoringStack',
      {
        snsTopic
      }
    );

    template = Template.fromStack(monitoringStack);
  });

  it('should create one alarm', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 1);
  });
});
