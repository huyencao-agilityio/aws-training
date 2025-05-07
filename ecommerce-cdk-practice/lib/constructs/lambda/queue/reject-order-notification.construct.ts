import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';

import { SqsLambdaConstruct } from './sqs-lambda.construct';

/**
 * Construct for creating Lambda function for the reject order notification queue
 */
export class RejectOrderNotificationLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const { librariesLayer, queue } = props;
    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    new SqsLambdaConstruct(this, 'RejectOrderNotification', {
      queue: queue,
      librariesLayer: librariesLayer,
      handlerFile: 'reject-order-notification',
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
      timeout: Duration.seconds(3),
      withSesPolicy: true,
    });
  }
}
