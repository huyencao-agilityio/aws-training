import { Duration } from 'aws-cdk-lib';
import { IFunction, Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Construct for creating Lambda function for API order
 */
export class OrderLambdaConstruct extends Construct {
  public readonly orderProductLambda: IFunction;
  public readonly acceptOrderLambda: IFunction;
  public readonly rejectOrderLambda: IFunction;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';
    const orderQueue = process.env.ORDER_QUEUE_URL || '';
    const acceptQueue = process.env.ACCEPT_QUEUE_URL || '';
    const rejectQueue = process.env.REJECT_QUEUE_URL || '';

    // Create the Lambda function for order product
    this.orderProductLambda = new Function(this, 'OrderProduct', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'order-product.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!order-product.js'],
      }),
      layers: [props.librariesLayer],
      timeout: Duration.minutes(15),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: orderQueue
      },
    });

    // Create the Lambda function for accept order
    this.acceptOrderLambda = new Function(this, 'AcceptOrder', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'accept-order.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!accept-order.js'],
      }),
      layers: [props.librariesLayer],
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: acceptQueue
      },
    });

    // Create the Lambda function for reject order
    this.rejectOrderLambda = new Function(this, 'RejectOrder', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'reject-order.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/orders/', {
        exclude: ['**/*', '!reject-order.js'],
      }),
      layers: [props.librariesLayer],
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser,
        QUEUE_URL: rejectQueue
      },
    });
  }
}
