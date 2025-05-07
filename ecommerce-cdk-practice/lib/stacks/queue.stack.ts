import { getLibrariesLayer } from '@utils/layer';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {
  OrderNotificationLambdaConstruct,
  AcceptOrderNotificationLambdaConstruct,
  RejectOrderNotificationLambdaConstruct
} from '../constructs/lambda/queue';
import { QueueConstruct } from '../constructs/queue/queue.construct';

export class QueueStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Define all queues that need to create
    const queues = [
      {
        baseName: 'OrderNotificationQueueCDK',
        lambdaConstructName: OrderNotificationLambdaConstruct
      },
      {
        baseName: 'AcceptOrderNotificationQueueCDK',
        lambdaConstructName: AcceptOrderNotificationLambdaConstruct
      },
      {
        baseName: 'RejectOrderNotificationQueueCDK',
        lambdaConstructName: RejectOrderNotificationLambdaConstruct
      },
    ];

    // Create queue and lambda function for queue
    for (const queue of queues) {
      const { baseName, lambdaConstructName } = queue;
      const queueConstruct = new QueueConstruct(this, `${baseName}Construct`, {
        baseName: baseName
      });

      new lambdaConstructName(this, `${baseName}Lambda`, {
        queue: queueConstruct.queue,
        librariesLayer: librariesLayer
      });

      new CfnOutput(this, `${baseName}Url`, {
        value: queueConstruct.queue.queueUrl,
        exportName: `${baseName}Url`,
      });

      new CfnOutput(this, `${baseName}Arn`, {
        value: queueConstruct.queue.queueArn,
        exportName: `${baseName}Arn`,
      });
    }
  }
}
