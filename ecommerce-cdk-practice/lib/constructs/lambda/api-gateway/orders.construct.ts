import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { getQueueResources } from '@helpers/queue.helper';
import { getDatabaseConfig } from '@helpers/database.helper';
import { QueueResources } from '@app-types/queue.type';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

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
    this.orderProductLambda = this.createOrderLambdaFunction(
      librariesLayer!,
      dbInstance,
      queueResources
    );

    // Create the Lambda function for accept order
    this.acceptOrderLambda = this.createAcceptOrderLambdaFunction(
      librariesLayer!,
      dbInstance,
      queueResources
    );

    // Create the Lambda function for reject order
    this.rejectOrderLambda = this.createRejectOrderLambdaFunction(
      librariesLayer!,
      dbInstance,
      queueResources
    );
  }

  /**
   * Create the Lambda function for order product
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param queueResources - The queue resources
   * @returns The Lambda function for order product
   */
  createOrderLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    queueResources: QueueResources
  ): Function {
    // Create the Lambda function for order product
    const lambdaFunction = new Function(this, 'OrderProduct', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'order-product.handler',
      code: Code.fromAsset(LAMBDA_PATH.ORDERS, {
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
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.ORDER.arn],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }

  /**
   * Create the Lambda function for accept order
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param queueResources - The queue resources
   * @returns The Lambda function for accept order
   */
  createAcceptOrderLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    queueResources: QueueResources
  ): Function {
    const lambdaFunction = new Function(this, 'AcceptOrderFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'accept-order.handler',
      code: Code.fromAsset(LAMBDA_PATH.ORDERS, {
        exclude: ['**/*', '!accept-order.js'],
      }),
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        QUEUE_URL: queueResources.ACCEPT.url
      },
    });

    // Add IAM policy to allow Lambda access to SQS
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.ACCEPT.arn],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }

  /**
   * Create the Lambda function for reject order
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param queueResources - The queue resources
   * @returns The Lambda function for reject order
   */
  createRejectOrderLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    queueResources: QueueResources
  ): Function {
    const lambdaFunction = new Function(this, 'RejectOrderFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'reject-order.handler',
      code: Code.fromAsset(LAMBDA_PATH.ORDERS, {
        exclude: ['**/*', '!reject-order.js'],
      }),
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        QUEUE_URL: queueResources.REJECT.url
      },
    });

    // Add IAM policy to allow Lambda access to SQS
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queueResources.REJECT.url],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }
}
