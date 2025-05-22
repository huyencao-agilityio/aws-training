import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AlarmConstruct } from '@constructs/cloudwatch/alarm.construct';
import { SnsTopicConstruct } from '@constructs/sns/sns-topic.construct';

/**
 * MonitoringStack is responsible for provisioning all monitoring in app.
 */
export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const snsConstruct = new SnsTopicConstruct(this, 'SnsTopicConstruct');

    new AlarmConstruct(this, 'AlarmConstruct', {
      snsTopic: snsConstruct.topic,
    });
  }
}
