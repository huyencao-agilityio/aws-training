import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

import { SnsAlarmTopicProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create new topic in SNS
 */
export class SnsTopicConstruct extends Construct {
  public readonly topic: Topic;

  constructor(scope: Construct, id: string, props: SnsAlarmTopicProps) {
    super(scope, id);

    const { email, topicName } = props;

    this.topic = new Topic(this, 'AlarmTopic', {
      displayName: topicName ?? 'Alarm Topic',
    });

    this.topic.addSubscription(
      new EmailSubscription(email)
    );
  }
}
