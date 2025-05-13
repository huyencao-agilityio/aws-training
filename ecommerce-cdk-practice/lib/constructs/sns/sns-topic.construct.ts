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

    this.topic = this.createTopic(topicName!, email);
  }

  /**
   * Create a new SNS topic
   *
   * @param topicName - The name of the topic to create
   * @param email - The email address to subscribe to the topic
   * @returns The created topic instance
   */
  createTopic(topicName: string, email: string): Topic {
    const topic = new Topic(this, 'AlarmTopic', {
      displayName: topicName ?? 'Alarm Topic',
    });

    topic.addSubscription(
      new EmailSubscription(email)
    );

    return topic;
  }
}
