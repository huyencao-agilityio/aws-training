import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@helpers/database.helper';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';
/**
 * Construct for creating Lambda function for scheduler in Event Bridge
 */
export class SchedulerLambdaConstruct extends Construct {
  public readonly schedulerLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    // Create the Lambda function for scheduler
    this.schedulerLambda = this.createSchedulerLambdaFunction(
      librariesLayer!,
      dbInstance
    );
  }

  /**
   * Create the Lambda function for scheduler
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @returns The Lambda function for scheduler
   */
  createSchedulerLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>
  ): Function {
    const lambdaFunction = new Function(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'weekly-top-products-report.handler',
      code: Code.fromAsset(LAMBDA_PATH.EVENT_BRIDGE, {
        exclude: ['**/*', '!weekly-top-products-report.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        ...dbInstance
      },
    });

    // Add policy for Lambda function
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));

    return lambdaFunction;
  }
}
