import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { EventBridgeStack } from '@stacks/event-bridge.stack';

describe('TestEventBridgeStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new event bridge stack
    const eventBridgeStack = new EventBridgeStack(
      app,
      'TestEventBridgeStack',
      {}
    );

    template = Template.fromStack(eventBridgeStack);
  });

  it('should create EventBridge schedule', () => {
    template.resourceCountIs('AWS::Scheduler::Schedule', 1);
  });

  it('should create a Lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create a Lambda@Edge function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create output for Schedule Name', () => {
    template.hasOutput('EventBridgeSchedulerName', {
      Value: 'ecommerce-weekly-report-product-dev'
    });
  });

  it('should create output for Schedule Arn', () => {
    template.hasOutput('EventBridgeSchedulerArn', {
      Value: {
        'Fn::GetAtt': Match.arrayWith([
          Match.stringLikeRegexp('.*EventBridgeScheduler.*'),
        ])
      },
    });
  });
});
