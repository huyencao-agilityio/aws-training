import { Duration } from 'aws-cdk-lib';
import { IFunction, Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Construct for creating Lambda function for API order
 */
export class OrderProductLambdaConstruct extends Construct {
  public readonly orderProductLambda: IFunction;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';
    const queue = process.env.QUEUE_URL || '';

    // Create the Lambda function for product retrieval
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
        QUEUE_URL: queue
      },
    });
  }
}
