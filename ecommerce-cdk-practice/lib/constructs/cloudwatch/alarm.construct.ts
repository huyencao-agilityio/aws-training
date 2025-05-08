import { Duration, Fn } from 'aws-cdk-lib';
import {
  Alarm,
  ComparisonOperator,
  Metric
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

import { AlarmConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create new alarm in cloudwatch
 */
export class AlarmConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlarmConstructProps) {
    super(scope, id);

    const { snsTopic } = props;

    const restApiId = Fn.importValue('ApiGatewayRestApiId');
    const stage = Fn.importValue('ApiGatewayRestApiStage');

    const metric = new Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: {
        ApiId: restApiId,
        Stage: stage,
      },
      statistic: 'Sum',
      period: Duration.minutes(1),
    });

    const alarm = new Alarm(this, 'ApiGateway5XXAlarm', {
      metric: metric,
      threshold: 0,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Alarm when 5XX errors > 0 in API Gateway stage ${stage}`,
    });

    alarm.addAlarmAction(new SnsAction(snsTopic));
  }
}
