import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import {
  AcceptOrderNotificationLambdaConstruct
} from '@constructs/lambda/queue/accept-order-notification.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('AcceptOrderNotificationLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'LibrariesLayer');
    // Create queue
    const queue = new Queue(stack, 'Queue');

    // Create accept order notification lambda construct
    new AcceptOrderNotificationLambdaConstruct(
      stack,
      'AcceptOrderNotificationLambdaConstruct',
      {
        librariesLayer,
        queue,
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create a lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should have a policy for lambda function', () => {
    template.resourceCountIs('AWS::IAM::Policy', 1);
  });

  it('should have a event source mapping', () => {
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
  });

  it('should create a lambda function with the correct config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-queue-accept-order-notification-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 5,
      Environment: {
        Variables: {
          DEFAULT_EMAIL_ADDRESS: Match.anyValue(),
          DB_HOST: Match.anyValue(),
          DB_USER: Match.anyValue(),
          DB_PASSWORD: Match.anyValue(),
          DB_NAME: Match.anyValue(),
        },
      },
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ],
    });
  });

  it('should add policy statement to lambda role', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Role: Match.anyValue(),
    }),

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: 'ses:SendEmail',
            Resource: {
              'Fn::Join': [
                '',
                [
                  'arn:aws:ses:us-east-1:123456789012:identity/',
                  {
                    Ref: Match.anyValue()
                  }
                ]
              ]
            }
          }),
        ]),
      },
    });
  });

  it('should add lambda function to source queue', () => {
    template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
      EventSourceArn: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('Queue.*'),
          'Arn'
        ]
      },
      FunctionName: {
        Ref: Match.stringLikeRegexp(
          '.*AcceptOrderNotificationConstruct.*'
        )
      }
    });
  });
});
