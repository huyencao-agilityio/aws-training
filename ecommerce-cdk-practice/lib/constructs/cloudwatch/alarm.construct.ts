import { Duration, Fn } from 'aws-cdk-lib';
import {
  Alarm,
  ComparisonOperator,
  Metric,
  Stats
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

import { AlarmConstructProps } from '@interfaces/construct.interface';
import { API_METRIC_ERRORS } from '@constants/metric.constant';

/**
 * Define the construct to create new alarm in cloudwatch
 */
export class AlarmConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlarmConstructProps) {
    super(scope, id);

    const { snsTopic } = props;

    const restApiId = Fn.importValue('ApiGatewayRestApiId');
    const stageApi = Fn.importValue('ApiGatewayRestApiStage');

    // Create metric for 5xx error
    const metric = this.createMetric5XXError(restApiId, stageApi);
    // Create alarm for 5xx error
    this.createAlarm5XXError(metric, snsTopic, stageApi);
  }

  /**
   * Creates a CloudWatch metric for monitoring 5XX errors in the API Gateway
   *
   * @param restApiId - The id of the rest api
   * @param stageApi - The stage of the rest api
   * @returns The created metric
   */
  createMetric5XXError(restApiId: string, stageApi: string): Metric {
    // Create a new metric
    const metric = new Metric({
      namespace: 'AWS/ApiGateway',
      metricName: API_METRIC_ERRORS.ERROR_5XX,
      dimensionsMap: {
        ApiId: restApiId,
        Stage: stageApi,
      },
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    });

    return metric;
  }

  /**
   * Create a new alarm for 5xx error in cloudwatch
   *
   * @param metric - The metric to create the alarm on
   * @param snsTopic - The sns topic to send the alarm to
   * @param stage - The stage of the rest api
   * @returns The created alarm
   */
  createAlarm5XXError(metric: Metric, snsTopic: Topic, stage: string): Alarm {
    // Create new alarm
    const alarm = new Alarm(this, 'ApiGateway5XXAlarm', {
      metric: metric,
      alarmName: `ApiGateway5XXAlarm-${stage}`,
      threshold: 0,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Alarm when 5XX errors > 0 in stage ${stage}`,
    });

    // Add alarm action
    alarm.addAlarmAction(new SnsAction(snsTopic));

    return alarm;
  }
}
