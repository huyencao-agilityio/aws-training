import path from 'path';

import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  ILayerVersion,
} from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Construct for creating a common construct to create Lambda function for queue
 */
export class SqsLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: QueueLambdaConstructProps) {
    super(scope, id);

    const {
      queue,
      librariesLayer,
      handlerFile,
      environment = {},
      timeout = Duration.seconds(3),
      withSesPolicy = true,
    } = props;

    // Create Lambda function
    this.createSqsLambdaFunction(
      id,
      librariesLayer!,
      timeout,
      environment,
      handlerFile!,
      withSesPolicy,
      queue
    );
  }

  /**
   * Create the Lambda function for the queue
   *
   * @param id - The id of the Lambda function
   * @param librariesLayer - The libraries layer
   * @param timeout - The timeout of the Lambda function
   * @param environment - The environment of the Lambda function
   * @param handlerFile - The handler file of the Lambda function
   * @param handlerFunction - The handler function of the Lambda function
   * @param withSesPolicy - Whether to add SES policy to the Lambda function
   * @param queue - The queue
   *
   * @returns The Lambda function for the queue
   */
  createSqsLambdaFunction(
    id: string,
    librariesLayer: ILayerVersion,
    timeout: Duration,
    environment: Record<string, string>,
    handlerFile: string,
    withSesPolicy: boolean,
    queue: Queue
  ): Function {
    // Create Lambda function
    const lambdaFunction = new NodejsFunction(this, `${id}Function`, {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.QUEUE}/${handlerFile}.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: librariesLayer ? [librariesLayer] : [],
      timeout,
      environment,
      functionName: buildResourceName(
        this, `${LAMBDA_FUNCTION_NAME.QUEUE}-${handlerFile}`
      )
    });

    // Optional: Add SES policy
    if (withSesPolicy) {
      lambdaFunction.addToRolePolicy(
        PolicyHelper.sesSendEmail(this)
      );
    }

    // Add event source to the Lambda function
    lambdaFunction.addEventSource(new SqsEventSource(queue));

    return lambdaFunction;
  }
}
