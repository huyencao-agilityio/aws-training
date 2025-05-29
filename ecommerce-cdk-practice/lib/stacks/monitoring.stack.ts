import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AlarmConstruct } from '@constructs/cloudwatch/alarm.construct';
import { MonitoringStackProps } from '@interfaces/stack.interface';

/**
 * MonitoringStack is responsible for provisioning all monitoring in app.
 */
export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { snsTopic } = props;

    new AlarmConstruct(this, 'AlarmConstruct', {
      snsTopic,
    });
  }
}
