import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

import { BaseConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create new scheduler in EventBridge
 */
export class EventBridgeConstruct extends Construct {
  public readonly schedule: CfnSchedule;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { lambdaFunction } = props;

    // Create IAM role for EventBridge Scheduler
    const schedulerRole = new Role(this, 'EventBridgeSchedulerRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com', {
        conditions: {
          'StringEquals': {
            'aws:SourceAccount': Stack.of(this).account,
          }
        }
      }),
    });
    schedulerRole.addToPolicy(new PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [lambdaFunction!.functionArn],
    }));

    // Create EventBridge Schedule
    this.schedule = new CfnSchedule(this, 'EventBridgeScheduler', {
      name: 'WeeklyReport',
      scheduleExpression: 'cron(20 10 ? * WED *)',
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpressionTimezone: 'Asia/Saigon',
      target: {
        arn: lambdaFunction!.functionArn,
        roleArn: schedulerRole.roleArn,
      },
      state: 'ENABLED'
    });
  }
}
