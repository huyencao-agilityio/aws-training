import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  OrderLambdaConstruct
} from '@constructs/lambda/api-gateway/orders.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestOrderLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'TestLibrariesLayer');

    // Create orders lambda construct
    new OrderLambdaConstruct(
      stack,
      'TestOrderLambdaConstruct',
      {
        librariesLayer
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create two lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 3);
  });

  describe('OrderProductLambdaFunction', () => {
    it('should create order product lambda function with config', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-order-product-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 900,
      Environment: {
        Variables: {
          DB_HOST: Match.anyValue(),
            DB_USER: Match.anyValue(),
            DB_PASSWORD: Match.anyValue(),
            DB_NAME: Match.anyValue(),
            ORDER_QUEUE_URL: Match.anyValue(),
          },
        },
        Layers: [
          {
            Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
          },
        ]
      });
    });

    it('should add policy to allow Lambda order product access to SQS', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'sqs:SendMessage',
              Effect: 'Allow',
              Resource: {
                'Fn::ImportValue': Match.stringLikeRegexp(
                  '.*order-notification-queue.*'
                )
              }
            },
          ],
        },
      });
    });
  });

  describe('AcceptOrderLambdaFunction', () => {
    it('should create accept order lambda function with config', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'ecommerce-api-accept-order-dev',
        Handler: 'index.handler',
        Runtime: 'nodejs20.x',
        Environment: {
          Variables: {
            DB_HOST: Match.anyValue(),
            DB_USER: Match.anyValue(),
            DB_PASSWORD: Match.anyValue(),
            DB_NAME: Match.anyValue(),
            ACCEPT_QUEUE_URL: Match.anyValue(),
          },
        },
        Layers: [
          {
            Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
          },
        ]
      });
    });

    it('should add policy to allow Lambda accept order access to SQS', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'sqs:SendMessage',
              Effect: 'Allow',
              Resource: {
                'Fn::ImportValue': Match.stringLikeRegexp(
                  '.*accept-order-notification-queue.*'
                )
              }
            },
          ],
        },
      });
    });
  });

  describe('RejectOrderLambdaFunction', () => {
    it('should create reject order lambda function with config', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'ecommerce-api-reject-order-dev',
        Handler: 'index.handler',
        Runtime: 'nodejs20.x',
        Environment: {
          Variables: {
            DB_HOST: Match.anyValue(),
            DB_USER: Match.anyValue(),
            DB_PASSWORD: Match.anyValue(),
            DB_NAME: Match.anyValue(),
            REJECT_QUEUE_URL: Match.anyValue(),
          },
        },
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
      });
    });

    it('should add policy to allow Lambda reject order access to SQS', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'sqs:SendMessage',
              Effect: 'Allow',
              Resource: {
                'Fn::ImportValue': Match.stringLikeRegexp(
                  '.*reject-order-notification-queue.*'
                )
              }
            },
          ],
        },
      });
    });
  });
});
