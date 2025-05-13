import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  Code,
  ILayerVersion,
} from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

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
      handlerFunction = 'handler',
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
      handlerFunction,
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
   * @returns The Lambda function for the queue
   */
  createSqsLambdaFunction(
    id: string,
    librariesLayer: ILayerVersion,
    timeout: Duration,
    environment: Record<string, string>,
    handlerFile: string,
    handlerFunction: string,
    withSesPolicy: boolean,
    queue: Queue
  ): Function {
    const lambdaFunction = new Function(this, `${id}Function`, {
      runtime: Runtime.NODEJS_20_X,
      handler: `${handlerFile}.${handlerFunction}`,
      code: Code.fromAsset(LAMBDA_PATH.QUEUE, {
        exclude: ['**/*', `!${handlerFile}.js`],
      }),
      layers: librariesLayer ? [librariesLayer] : [],
      timeout,
      environment,
    });

    // Optional: Add SES policy
    if (withSesPolicy) {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: ['ses:SendEmail'],
          resources: ['*'],
        }),
      );
    }

    // Add event source to the Lambda function
    lambdaFunction.addEventSource(new SqsEventSource(queue));

    return lambdaFunction;
  }
}
