import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { getLibrariesLayer } from 'lib/shared/layer.helper';
import {
  EventBridgeConstruct
} from '@constructs/event-bridge/event-bridge.construct';
import { SchedulerLambdaConstruct } from '@constructs/lambda/event-bridge';

/**
 * EventBridgeStack is responsible for provisioning config for EventBridge
 */
export class EventBridgeStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Create the Lambda function for scheduler
    const schedulerLambdaConstruct = new SchedulerLambdaConstruct(
      this,
      'SchedulerLambdaConstruct', {
        librariesLayer: librariesLayer
      }
    );

    // Create event bridge construct
    const eventBridgeConstruct = new EventBridgeConstruct(this, 'EventBridgeConstruct', {
      lambdaFunction: schedulerLambdaConstruct.schedulerLambda
    });

    // Create a CloudFormation output to export the name and arn of the EventBridge
    new CfnOutput(this, 'EventBridgeSchedulerName', {
      value: eventBridgeConstruct.schedule.name!,
      description: 'EventBridge Scheduler Name',
    });

    new CfnOutput(this, 'EventBridgeSchedulerArn', {
      value: eventBridgeConstruct.schedule.attrArn,
      description: 'EventBridge Scheduler ARN',
    });
  }
}
