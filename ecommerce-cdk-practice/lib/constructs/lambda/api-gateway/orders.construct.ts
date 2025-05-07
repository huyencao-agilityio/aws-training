import { Duration, Fn } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';

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

    const acceptQueueUrl = Fn.importValue('AcceptOrderNotificationQueueCDKUrl');
    const acceptQueueArn = Fn.importValue('AcceptOrderNotificationQueueCDKArn');
    const rejectQueueUrl = Fn.importValue('RejectOrderNotificationQueueCDKUrl');
    const rejectQueueArn = Fn.importValue('RejectOrderNotificationQueueCDKArn');
    const orderQueueUrl = Fn.importValue('OrderNotificationQueueCDKUrl');
    const orderQueueArn = Fn.importValue('OrderNotificationQueueCDKArn');

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

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
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: orderQueueUrl
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.orderProductLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [orderQueueArn],
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
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: acceptQueueUrl
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.acceptOrderLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [acceptQueueArn],
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
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: rejectQueueUrl
      },
    });
    // Add IAM policy to allow Lambda access to SQS
    this.rejectOrderLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [rejectQueueArn],
      effect: Effect.ALLOW
    }));
  }
}
