import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { SecretHelper } from '@shared/secret.helper';

import { SqsLambdaConstruct } from './sqs-lambda.construct';

/**
 * Construct for creating Lambda function for the order notification queue
 */
export class OrderNotificationLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;

    // Create the SQS Lambda Construct
    this.createSqsLambdaConstruct(
      librariesLayer!,
      queue
    );
  }

  /**
   * Create the SQS Lambda Construct
   *
   * @param librariesLayer - The libraries layer
   * @param queue - The queue
   * @returns The SqsLambdaConstruct
   */
  createSqsLambdaConstruct(
    librariesLayer: ILayerVersion,
    queue: Queue
  ): SqsLambdaConstruct {
    // Get the default and admin email addresses
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      'DefaultEmailAddress'
    );
    const adminEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      'AdminEmailAddress'
    );

    const construct = new SqsLambdaConstruct(
      this,
      'OrderNotificationConstruct',
      {
        queue: queue,
        librariesLayer: librariesLayer,
        handlerFile: 'order-notification',
        timeout: Duration.seconds(3),
        environment: {
          DEFAULT_EMAIL_ADDRESS: defaultEmailAddress,
          ADMIN_EMAIL_ADDRESS: adminEmailAddress
        },
        withSesPolicy: true
      }
    );

    return construct;
  }
}
