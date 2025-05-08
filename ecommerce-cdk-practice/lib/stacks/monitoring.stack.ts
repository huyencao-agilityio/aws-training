import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { EMAIL_ADDRESS } from '@constants/email.constant';

import { AlarmConstruct } from '../constructs/cloudwatch/alarm.construct';
import { SnsTopicConstruct } from '../constructs/sns/sns-topic.construct';

/**
 * ApiStack is responsible for provisioning all monitoring in app.
 */
export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const snsConstruct = new SnsTopicConstruct(this, 'SnsTopicConstruct', {
      email: EMAIL_ADDRESS,
      topicName: 'API Gateway 5XX Alarm Topic',
    });

    new AlarmConstruct(this, 'AlarmConstruct', {
      snsTopic: snsConstruct.topic,
    });
  }
}
