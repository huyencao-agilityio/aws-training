import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { EventBridgeConstruct } from '../constructs/event-bridge/event-bridge.construct';

/**
 * EventBridgeStack is responsible for provisioning config for EventBridge
 */
export class EventBridgeStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new EventBridgeConstruct(this, 'EventBridgeConstruct')
  }
}
