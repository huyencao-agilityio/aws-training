import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  Code,
} from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';

import { QueueLambdaConstructProps } from '@interfaces/construct.interface';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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
    const lambdaFn = new Function(this, `${id}Function`, {
      runtime: Runtime.NODEJS_20_X,
      handler: `${handlerFile}.${handlerFunction}`,
      code: Code.fromAsset(`dist/src/lambda-handler/queue/`, {
        exclude: ['**/*', `!${handlerFile}.js`],
      }),
      layers: librariesLayer ? [librariesLayer] : [],
      timeout,
      environment,
    });

    // Optional: Add SES policy
    if (withSesPolicy) {
      lambdaFn.addToRolePolicy(
        new PolicyStatement({
          actions: ['ses:SendEmail'],
          resources: ['*'],
        }),
      );
    }

    lambdaFn.addEventSource(new SqsEventSource(queue));
  }
}
