import { App, Stack, Fn } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Stats } from 'aws-cdk-lib/aws-cloudwatch';
import { Topic } from 'aws-cdk-lib/aws-sns';

import { AlarmConstruct } from '@constructs/cloudwatch/alarm.construct';
import { API_METRIC_ERRORS } from '@constants/metric.constant';

describe('AlarmConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;
  let snsTopic: Topic;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestAlarmStack');

    // Mock Fn.importValue
    jest.spyOn(Fn, 'importValue').mockImplementation((value) => {
      if (value === 'ApiGatewayRestApiId') return 'restApiId123';
      if (value === 'ApiGatewayRestApiStage') return 'dev';
      return '';
    });

    snsTopic = new Topic(stack, 'TestTopic');
    new AlarmConstruct(stack, 'TestAlarmConstruct', {
      snsTopic
    });

    template = Template.fromStack(stack);
  });

  it('should create exactly one alarm', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 1);
  });

  it('should create CloudWatch metric for 5xx errors', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      MetricName: API_METRIC_ERRORS.ERROR_5XX,
      Namespace: 'AWS/ApiGateway',
      Dimensions: [
        {
          Name: 'ApiId',
          Value: 'restApiId123'
        },
        {
          Name: 'Stage',
          Value: 'dev'
        }
      ],
      Statistic: Stats.SUM,
      Period: 60,
      Threshold: 0,
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      AlarmDescription: 'Alarm when 5XX errors > 0 in stage dev',
      AlarmName: 'ApiGateway5XXAlarm-dev',
      AlarmActions: [
        {
          Ref: Match.stringLikeRegexp('TestTopic')
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
