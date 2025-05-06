import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { Construct } from 'constructs';

export class EventBridgeConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create EventBridge Schedule
    new CfnSchedule(this, 'EventBridgeScheduler', {
      name: 'WeeklyReport',
      scheduleExpression: 'cron(20 10 ? * WED *)',
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpressionTimezone: 'Asia/Saigon',
      target: {
        arn: '',
        roleArn: '',
      },
      state: 'ENABLED'
    });
  }
}
