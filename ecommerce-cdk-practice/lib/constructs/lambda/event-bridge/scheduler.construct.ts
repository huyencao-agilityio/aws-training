import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  Code
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * Construct for creating Lambda function for scheduler in Event Bridge
 */
export class SchedulerLambdaConstruct extends Construct {
  public readonly schedulerLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for product retrieval
    this.schedulerLambda = new Function(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'weekly-top-products-report.handler',
      code: Code.fromAsset('dist/src/lambda-handler/event-bridge/', {
        exclude: ['**/*', '!weekly-top-products-report.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
    });

    // Add policy for Lambda function
    this.schedulerLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));
  }
}
