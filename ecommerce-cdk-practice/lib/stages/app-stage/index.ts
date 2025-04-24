import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QueueStack } from '../../stacks/queue/queue-stack';
import { EventBridgeStack } from '../../stacks/events/eventbridge-stack';
import { ApiStack } from '../../stacks/api/api-stack';

export class AppStage extends Stage {
  public readonly apiStack: ApiStack;
  public readonly queueStack: QueueStack;
  public readonly eventStack: EventBridgeStack;

  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    this.queueStack = new QueueStack(this, 'QueueStack', {
      stackName: props.stageName,
    });

    this.eventStack = new EventBridgeStack(this, 'EventStack', {
      stackName: props.stageName,
    });

    this.apiStack = new ApiStack(this, 'ApiStack', {
      stackName: props.stageName,
    });
  }
}
