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
 * Construct for creating Lambda function for the accept order notification queue
 */
export class AcceptOrderNotificationLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

    // Create the SQS Lambda Construct
    this.createSqsLambdaConstruct(
      librariesLayer!,
      dbInstance,
      queue
    );
  }

  /**
   * Create the SQS Lambda Construct
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @returns The Lambda function for accept order notification
   */
  createSqsLambdaConstruct(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    queue: Queue
  ): SqsLambdaConstruct {
    // Get the default email address
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DefaultEmailAddress
    );

    const construct = new SqsLambdaConstruct(
      this,
      'AcceptOrderNotificationConstruct',
      {
        queue:queue,
        librariesLayer: librariesLayer,
        handlerFile: 'accept-order-notification',
        environment: {
          ...dbInstance,
          DEFAULT_EMAIL_ADDRESS: defaultEmailAddress
        },
        timeout: Duration.seconds(5),
        withSesPolicy: true,
      }
    );

    return construct;
  }
}
