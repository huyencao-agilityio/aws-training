import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { SCHEDULE_EXPRESSIONS, TIMEZONES } from '@constants/schedule.constant';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Define the construct to create new scheduler in EventBridge
 */
export class EventBridgeConstruct extends Construct {
  public readonly schedule: CfnSchedule;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { lambdaFunction } = props;

    // Create EventBridge Schedule
    this.schedule = this.createSchedule(lambdaFunction!);
  }

  /**
   * Create a new role for EventBridge Scheduler
   *
   * @param functionArn - The arn lambda function to schedule
   * @returns The created role instance
   */
  createRoleForSchedule(functionArn: string): Role {
    const role = new Role(this, 'EventBridgeSchedulerRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com', {
        conditions: {
          'StringEquals': {
            'aws:SourceAccount': Stack.of(this).account,
          }
        }
      }),
    });

    role.addToPolicy(
      PolicyHelper.lambdaInvoke(functionArn)
    );

    return role;
  }

  /**
   * Create a new schedule in EventBridge
   *
   * @param lambdaFunction - The lambda function to schedule
   * @returns The created schedule instance
   */
  createSchedule(lambdaFunction: IFunction): CfnSchedule {
    const functionArn = lambdaFunction!.functionArn;
    const role = this.createRoleForSchedule(functionArn);

    const schedule = new CfnSchedule(this, 'EventBridgeScheduler', {
      name: buildResourceName(this, 'weekly-report-product'),
      scheduleExpression: SCHEDULE_EXPRESSIONS.WEEKLY_REPORT,
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpressionTimezone: TIMEZONES.VIETNAM,
      target: {
        arn: functionArn,
        roleArn: role.roleArn,
        retryPolicy: {
          maximumEventAgeInSeconds: 60,
          maximumRetryAttempts: 0
        }
      },
      state: 'ENABLED'
    });

    return schedule;
  }
}
