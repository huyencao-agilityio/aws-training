import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

import { buildResourceName } from '@shared/resource.helper';
import { DEFAULT_EMAIL_ADDRESS } from '@constants/email.constant';

/**
 * Define the construct to create new topic in SNS
 */
export class SnsTopicConstruct extends Construct {
  public readonly topic: Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.topic = this.createTopic();
  }

  /**
   * Create a new SNS topic
   *
   * @param topicName - The name of the topic to create
   * @param email - The email address to subscribe to the topic
   * @returns The created topic instance
   */
  createTopic(): Topic {
    const topic = new Topic(this, 'AlarmTopic', {
      displayName: buildResourceName(this, '5xx-alarm'),
    });

    topic.addSubscription(
      new EmailSubscription(DEFAULT_EMAIL_ADDRESS)
    );

    return topic;
  }
}
