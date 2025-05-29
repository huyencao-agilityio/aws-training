import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

import { SnsTopicConstruct } from '@constructs/sns/sns-topic.construct';

/**
 * SnsStack is responsible for provisioning all SNS in app.
 */
export class SnsStack extends Stack {
  public readonly snsTopicConstruct: SnsTopicConstruct;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.snsTopicConstruct = new SnsTopicConstruct(this, 'SnsTopicConstruct');
  }
}
