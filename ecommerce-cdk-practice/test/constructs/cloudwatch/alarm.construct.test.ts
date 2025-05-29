import { App, Stack, Fn, Token } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Topic } from 'aws-cdk-lib/aws-sns';

import { AlarmConstruct } from '@constructs/cloudwatch/alarm.construct';

describe('TestAlarmConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    // Mock value for Rest API Id and Stage
    jest.spyOn(Fn, 'importValue').mockImplementation((value) => {
      if (value === 'ApiGatewayRestApiId') {
        return Token.asString({ 'Fn::ImportValue': 'ApiGatewayRestApiId' });
      }
      if (value === 'ApiGatewayRestApiStage') {
        return Token.asString({
          'Fn::ImportValue': 'ApiGatewayRestApiStage'
        });
      }
      return '';
    });

    // Get SNS Topic from existing topic
    const snsTopic = Topic.fromTopicArn(
      stack,
      'TestFromTopic',
      Token.asString({
        'Fn::ImportValue': 'arn:aws:sns:us-east-1:123456789012:TestTopic'
      })
    );

    // Create Alarm Construct
    new AlarmConstruct(stack, 'TestAlarmConstruct', {
      snsTopic
    });

    template = Template.fromStack(stack);
  });

  it('should create one alarm', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 1);
  });

  it('should create CloudWatch metric for 5xx errors', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      MetricName: '5XXError',
      Namespace: 'AWS/ApiGateway',
      Dimensions: [
        {
          Name: 'ApiId',
          Value: {
            'Fn::ImportValue': 'ApiGatewayRestApiId'
          }
        },
        {
          Name: 'Stage',
          Value: {
            'Fn::ImportValue': 'ApiGatewayRestApiStage'
          }
        }
      ],
      Statistic: 'Sum',
      Period: 60,
      Threshold: 0,
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      AlarmDescription: {
        'Fn::Join': [
          '',
          [
            'Alarm when 5XX errors > 0 in stage ',
            {
              'Fn::ImportValue': 'ApiGatewayRestApiStage'
            }
          ]
        ]
      },
      AlarmName: {
        'Fn::Join': [
          '',
          [
            'ApiGateway5XXAlarm-',
            {
              'Fn::ImportValue': 'ApiGatewayRestApiStage'
            }
          ]
        ]
      },
      AlarmActions: [
        {
          'Fn::ImportValue': Match.stringLikeRegexp('.*TestTopic.*')
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
