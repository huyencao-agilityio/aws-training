import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';

import { SqsLambdaConstruct } from './sqs-lambda.construct';

/**
 * Construct for creating Lambda function for the order notification queue
 */
export class OrderNotificationLambdaConstruct extends Construct {
  public readonly orderNotificationLambda: SqsLambdaConstruct;

  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;

    this.orderNotificationLambda = new SqsLambdaConstruct(this, 'OrderNotification', {
      queue: queue,
      librariesLayer: librariesLayer,
      handlerFile: 'order-notification',
      timeout: Duration.seconds(3),
      withSesPolicy: true
    });
  }
}
