import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { QueueStack } from '@stacks/queue.stack';

describe('TestQueueStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new queue stack
    const queueStack = new QueueStack(app, 'TestQueueStack', {});

    template = Template.fromStack(queueStack);
  });

  describe('Count total resources in Queue Stack', () => {
    it('should create three main queues and three DLQ queues', () => {
      template.resourceCountIs('AWS::SQS::Queue', 6);
    });

    it('should create three Lambda functions', () => {
      template.resourceCountIs('AWS::Lambda::Function', 3);
    });
  });

  describe('Output for Queue Stack', () => {
    it('should create output for Order Notification Queue Url', () => {
      template.hasOutput('ecommerceordernotificationqueuedevurl', {
        Export: {
          Name: 'ecommerce-order-notification-queue-dev-url'
        },
        Value: {
          Ref: Match.stringLikeRegexp(
            '.*ecommerceordernotificationqueuedev.*'
          ),
        },
      });
    });

    it('should create output for Order Notification Queue Arn', () => {
      template.hasOutput('ecommerceordernotificationqueuedevarn', {
        Export: {
          Name: 'ecommerce-order-notification-queue-dev-arn'
        },
        Value: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp(
              '.*ecommerceordernotificationqueuedev.*'
            ),
            'Arn'
          ]
        },
      });
    });

    it('should create output for Accept Order Notification Queue Url', () => {
      template.hasOutput('ecommerceacceptordernotificationqueuedevurl', {
        Export: {
          Name: 'ecommerce-accept-order-notification-queue-dev-url'
        },
        Value: {
          Ref: Match.stringLikeRegexp(
            '.*ecommerceacceptordernotificationqueuedev.*'
          ),
        },
      });
    });

    it('should create output for Accept Order Notification Queue Arn', () => {
      template.hasOutput('ecommerceacceptordernotificationqueuedevarn', {
        Export: {
          Name: 'ecommerce-accept-order-notification-queue-dev-arn'
        },
        Value: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp(
              '.*ecommerceacceptordernotificationqueuedev.*'
            ),
            'Arn'
          ]
        },
      });
    });

    it('should create output for Reject Order Notification Queue Url', () => {
      template.hasOutput('ecommercerejectordernotificationqueuedevurl', {
        Export: {
          Name: 'ecommerce-reject-order-notification-queue-dev-url'
        },
        Value: {
          Ref: Match.stringLikeRegexp(
            '.*ecommercerejectordernotificationqueuedev.*'
          ),
        },
      });
    });

    it('should create output for Reject Order Notification Queue Arn', () => {
      template.hasOutput('ecommercerejectordernotificationqueuedevarn', {
        Export: {
          Name: 'ecommerce-reject-order-notification-queue-dev-arn'
        },
        Value: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp(
              '.*ecommercerejectordernotificationqueuedev.*'
            ),
            'Arn'
          ]
        },
      });
    });
  });
});
