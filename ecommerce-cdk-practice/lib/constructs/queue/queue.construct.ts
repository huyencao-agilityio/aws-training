import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { QueueConstructProps } from '@interfaces/construct.interface';

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
    this.dlqQueue = this.createDeadLetterQueue(baseName!, isFifo);
    // Create queue in SQS
    this.queue = this.createMainQueue(baseName!, isFifo, maxReceiveCount);
  }

  /**
   * Create a new queue in SQS
   *
   * @param baseName - The base name of the queue
   * @param isFifo - Whether the queue is a FIFO queue
   * @param maxReceiveCount - The maximum number of times a message can be received
   * @returns The created queue instance
   */
  createMainQueue(
    baseName: string,
    isFifo: boolean,
    maxReceiveCount: number
  ): Queue {
    const queue = new Queue(this, `${baseName}Queue`, {
      queueName: isFifo ? `${baseName}.fifo` : baseName,
      visibilityTimeout: Duration.seconds(30),
      deadLetterQueue: {
        queue: this.dlqQueue,
        maxReceiveCount: maxReceiveCount,
      },
      fifo: isFifo
    });

    return queue;
  }

  /**
   * Create a new dead letter queue in SQS
   *
   * @param baseName - The base name of the queue
   * @param isFifo - Whether the queue is a FIFO queue
   * @returns The created dead letter queue instance
   */
  createDeadLetterQueue(baseName: string, isFifo: boolean): Queue {
    const dlq = new Queue(this, `${baseName}DLQ`, {
      queueName: isFifo ? `${baseName}-DLQ.fifo` : `${baseName}DLQ`,
      retentionPeriod: Duration.days(4),
      fifo: isFifo
    });

    return dlq;
  }

}
