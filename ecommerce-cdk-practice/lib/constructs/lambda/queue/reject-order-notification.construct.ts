import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@helpers/database.helper';

import { SqsLambdaConstruct } from './sqs-lambda.construct';

/**
 * Construct for creating Lambda function for the reject order notification queue
 */
export class RejectOrderNotificationLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    new SqsLambdaConstruct(this, 'RejectOrderNotification', {
      queue: queue,
      librariesLayer: librariesLayer,
      handlerFile: 'reject-order-notification',
      environment: {
        ...dbInstance
      },
      timeout: Duration.seconds(3),
      withSesPolicy: true,
    });
  }
}
