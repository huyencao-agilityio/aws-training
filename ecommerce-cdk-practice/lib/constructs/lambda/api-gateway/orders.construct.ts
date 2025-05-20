import path from 'path';

import { Duration } from 'aws-cdk-lib';
import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { getQueueResources } from '@shared/queue.helper';
import { getDatabaseConfig } from '@shared/database.helper';
import { PolicyHelper } from '@shared/policy.helper';
import { QueueResources } from '@app-types/queue.type';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

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
    const dbInstance = getDatabaseConfig(scope);

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
    const lambdaFunction = new NodejsFunction(this, 'OrderProduct', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.ORDERS}/order-product.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      timeout: Duration.minutes(15),
      environment: {
        ...dbInstance,
        ORDER_QUEUE_URL: queueResources.ORDER.url
      },
      functionName: LAMBDA_FUNCTION_NAME.API_ORDER_PRODUCT
    });

    // Add IAM policy to allow Lambda access to SQS
    lambdaFunction.addToRolePolicy(
      PolicyHelper.sqsSendMessage(queueResources.ORDER.arn)
    );

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
    const lambdaFunction = new NodejsFunction(this, 'AcceptOrderFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.ORDERS}/accept-order.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        ACCEPT_QUEUE_URL: queueResources.ACCEPT.url
      },
      functionName: LAMBDA_FUNCTION_NAME.API_ACCEPT_ORDER
    });

    // Add IAM policy to allow Lambda access to SQS
    lambdaFunction.addToRolePolicy(
      PolicyHelper.sqsSendMessage(queueResources.ACCEPT.arn)
    );

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
    const lambdaFunction = new NodejsFunction(this, 'RejectOrderFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.ORDERS}/reject-order.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      environment: {
        ...dbInstance,
        REJECT_QUEUE_URL: queueResources.REJECT.url
      },
      functionName: LAMBDA_FUNCTION_NAME.API_REJECT_ORDER
    });

    // Add IAM policy to allow Lambda access to SQS
    lambdaFunction.addToRolePolicy(
      PolicyHelper.sqsSendMessage(queueResources.REJECT.arn)
    );

    return lambdaFunction;
  }
}
