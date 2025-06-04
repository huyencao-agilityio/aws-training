import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { SecretHelper } from '@shared/secret.helper';
import { ParameterKeys } from '@constants/parameter-keys.constant';

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
      queue,
      librariesLayer
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
    queue: Queue,
    librariesLayer?: ILayerVersion,
  ): SqsLambdaConstruct {
    // Get the default and admin email addresses
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DefaultEmailAddress
    );
    const adminEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.AdminEmailAddress
    );

    const construct = new SqsLambdaConstruct(
      this,
      'OrderNotificationConstruct',
      {
        queue: queue,
        librariesLayer: librariesLayer,
        handlerFile: 'order-notification',
        timeout: Duration.seconds(5),
        environment: {
          DEFAULT_EMAIL_ADDRESS: defaultEmailAddress,
          ADMIN_EMAIL_ADDRESS: adminEmailAddress
        }
      }
    );

    return construct;
  }
}
