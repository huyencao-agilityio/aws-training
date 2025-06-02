import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@shared/database.helper';
import { SecretHelper } from '@shared/secret.helper';
import { ParameterKeys } from '@constants/parameter-keys.constant';

import { SqsLambdaConstruct } from './sqs-lambda.construct';

/**
 * Construct for creating Lambda function for the reject order notification queue
 */
export class RejectOrderNotificationLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

    // Create the SQS Lambda Construct
    this.createSqsLambdaConstruct(
      queue,
      dbInstance,
      librariesLayer
    );
  }

  /**
   * Create the SQS Lambda Construct
   *
   * @param librariesLayer - The libraries layer
   * @param queue - The queue
   * @param dbInstance - The database instance
   * @returns The SQS Lambda Construct
   */
  createSqsLambdaConstruct(
    queue: Queue,
    dbInstance: Record<string, string>,
    librariesLayer?: ILayerVersion,
  ): SqsLambdaConstruct {
    // Get the default email address
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DefaultEmailAddress
    );

    const construct = new SqsLambdaConstruct(
      this,
      'RejectOrderNotificationConstruct',
      {
        queue: queue,
        librariesLayer: librariesLayer,
        handlerFile: 'reject-order-notification',
        environment: {
          ...dbInstance,
          DEFAULT_EMAIL_ADDRESS: defaultEmailAddress
        },
        timeout: Duration.seconds(5)
      }
    );

    return construct;
  }
}
