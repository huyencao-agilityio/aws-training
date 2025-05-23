import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';

import {
  EventBridgeConstruct
} from '@constructs/event-bridge/event-bridge.construct';
import { SCHEDULE_EXPRESSIONS, TIMEZONES } from '@constants/schedule.constant';

describe('EventBridgeConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;
  let lambdaFunctionId: string;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestEventBridgeStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    const lambdaFunction = new Function(stack, 'TestLambda', {
      functionName: 'test-lambda',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {};'),
    });
    new EventBridgeConstruct(stack, 'TestEventBridgeConstruct', {
      lambdaFunction
    });

    template = Template.fromStack(stack);

    // Get the lambda function id
    lambdaFunctionId = Object.keys(
      template.findResources('AWS::Lambda::Function')
    )[0];

  });

  it('should create EventBridge schedule', () => {
    template.resourceCountIs('AWS::Scheduler::Schedule', 1);
  });

  it('should create schedule with correct configuration', () => {
    template.hasResourceProperties('AWS::Scheduler::Schedule', {
      Name: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
      ScheduleExpression: SCHEDULE_EXPRESSIONS.WEEKLY_REPORT,
      ScheduleExpressionTimezone: TIMEZONES.VIETNAM,
      State: 'ENABLED',
      FlexibleTimeWindow: {
        Mode: 'OFF'
      },
      Target: {
        Arn: {
          'Fn::GetAtt': [
            lambdaFunctionId,
            'Arn'
          ]
        },
        RoleArn: Match.anyValue(),
        RetryPolicy: {
          MaximumEventAgeInSeconds: 60,
          MaximumRetryAttempts: 0
        }
      }
    });
  });

  it('should create the scheduler role', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'scheduler.amazonaws.com'
            },
            Condition: {
              StringEquals: {
                'aws:SourceAccount': '123456789012'
              }
            }
          }
        ]
      }
    });
  });

  it('should add policy to scheduler role to invoke lambda function', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'lambda:InvokeFunction',
            Effect: 'Allow',
            Resource: {
              'Fn::GetAtt': [
                lambdaFunctionId,
                'Arn'
              ]
            }
          }
        ]
      }
    });
  });
});
