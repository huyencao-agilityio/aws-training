import { Duration, Fn } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { getQueueResources } from '@helpers/queue.helper';
import { getDatabaseConfig } from '@helpers/database.helper';

/**
 * Construct for creating Lambda function for API order
 */
export class OrderLambdaConstruct extends Construct {
  public readonly orderProductLambda: Function;
  public readonly acceptOrderLambda: Function;
  public readonly rejectOrderLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Get the queue resources
    const queueResources = getQueueResources();
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    // Create the Lambda function for order product
    this.orderProductLambda = new Function(this, 'OrderProduct', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'order-product.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!order-product.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.minutes(15),
      environment: {
        ...dbInstance,
        QUEUE_URL: queueResources.ORDER.url
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.orderProductLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.ORDER.arn],
      effect: Effect.ALLOW
    }));

    // Create the Lambda function for accept order
    this.acceptOrderLambda = new Function(this, 'AcceptOrder', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'accept-order.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!accept-order.js'],
      }),
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        QUEUE_URL: queueResources.ACCEPT.url
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.acceptOrderLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.ACCEPT.arn],
      effect: Effect.ALLOW
    }));

    // Create the Lambda function for reject order
    this.rejectOrderLambda = new Function(this, 'RejectOrder', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'reject-order.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!reject-order.js'],
      }),
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        QUEUE_URL: queueResources.REJECT.url
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.rejectOrderLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.REJECT.url],
      effect: Effect.ALLOW
    }));
  }
}
