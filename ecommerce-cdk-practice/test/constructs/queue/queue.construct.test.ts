import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { QueueConstruct } from '@constructs/queue/queue.construct';

describe('TestQueueConstruct', () => {
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    const app = new App();
    stack = new Stack(app, 'TestStack');
  });

  describe('Standard Queue', () => {
    beforeEach(() => {
      new QueueConstruct(stack, 'TestQueueConstruct', {
        baseName: 'test-queue'
      });

      template = Template.fromStack(stack);
    });

    it('should create main queue and DLQ Queue', () => {
      template.resourceCountIs('AWS::SQS::Queue', 2);
    });

    it('should create main queue with correct configuration', () => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: 'test-queue',
        VisibilityTimeout: 30,
        RedrivePolicy: {
          maxReceiveCount: 2,
          deadLetterTargetArn: Match.anyValue()
        }
      });
    });

    it('should create DLQ with correct configuration', () => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: 'test-queuedlq',
        MessageRetentionPeriod: 345600
      });
    });
  });

  describe('FIFO Queue', () => {
    beforeEach(() => {
      new QueueConstruct(stack, 'TestFifoQueueConstruct', {
        baseName: 'test-fifo-queue',
        isFifo: true,
        maxReceiveCount: 3
      });

      template = Template.fromStack(stack);
    });

    it('should create FIFO main queue and DLQ', () => {
      template.resourceCountIs('AWS::SQS::Queue', 2);
    });

    it('should create FIFO main queue with correct configuration', () => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: 'test-fifo-queue.fifo',
        VisibilityTimeout: 30,
        FifoQueue: true,
        RedrivePolicy: {
          maxReceiveCount: 3,
          deadLetterTargetArn: Match.anyValue()
        }
      });
    });

    it('should create FIFO DLQ with correct configuration', () => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: 'test-fifo-queue-dlq.fifo',
        MessageRetentionPeriod: 345600,
        FifoQueue: true
      });
    });
  });
});
