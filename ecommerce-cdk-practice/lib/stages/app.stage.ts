import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiStack } from '../stacks/api.stack';
import { AuthStack } from '../stacks/auth.stack';
import { EventBridgeStack } from '../stacks/event-bridge.stack';
import { QueueStack } from '../stacks/queue.stack';

/**
 * AppStage is responsible for grouping and deploying all application stacks
 * such as API and authentication stacks.
 */
export class AppStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const queueStack = new QueueStack(this, 'QueueStack', {
      stackName: 'staging-queue'
    });

    const authStack = new AuthStack(this, 'AuthStack', {
      stackName: 'staging-auth',
    });

    const apiStack = new ApiStack(this, 'ApiStack', {
      stackName: 'staging-api',
      userPool: authStack.userPoolConstruct.userPool
    });

    // Explicit dependency
    apiStack.addDependency(authStack);

    const eventBridgeStack = new EventBridgeStack(this, 'EventBridgeStack', {
      stackName: 'staging-event-bridge'
    });

  }
}
