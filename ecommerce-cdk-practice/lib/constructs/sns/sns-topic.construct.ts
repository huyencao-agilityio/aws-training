import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

import { buildResourceName } from '@shared/resource.helper';
import { SecretHelper } from '@shared/secret.helper';
import { ParameterKeys } from '@constants/parameter-keys.constant';

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
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DefaultEmailAddress
    );

    const topic = new Topic(this, 'AlarmTopic', {
      displayName: buildResourceName(this, 'alarm-topic'),
    });

    // NOTE: Need to confirm subscription via email address when deploy the first time
    topic.addSubscription(
      new EmailSubscription(defaultEmailAddress)
    );

    return topic;
  }
}
