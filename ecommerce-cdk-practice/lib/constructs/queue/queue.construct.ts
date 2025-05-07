import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';

import { QueueConstructProps } from '@interfaces/construct.interface';
import { Queue } from 'aws-cdk-lib/aws-sqs';

/**
 * Define the construct to create new queue and dead letter queue in SQS
 */
export class QueueConstruct extends Construct {
  public readonly queue: Queue;
  public readonly dlqQueue: Queue;

  constructor(scope: Construct, id: string, props: QueueConstructProps) {
    super(scope, id);

    const { baseName, maxReceiveCount = 2, isFifo = false } = props;

    // Create dead letter queue for main queue
    this.dlqQueue = new Queue(this, `${baseName}DLQ`, {
      queueName: isFifo ? `${baseName}-DLQ.fifo` : `${baseName}DLQ`,
      retentionPeriod: Duration.days(4),
      fifo: isFifo
    });

    // Create queue in SQS
    this.queue = new Queue(this, `${baseName}Queue`, {
      queueName: isFifo ? `${baseName}.fifo` : baseName,
      visibilityTimeout: Duration.seconds(30),
      deadLetterQueue: {
        queue: this.dlqQueue,
        maxReceiveCount: maxReceiveCount,
      },
      fifo: isFifo
    });
  }
}
