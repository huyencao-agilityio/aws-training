import path from 'path';

import { Construct } from 'constructs';
import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@shared/database.helper';
import { PolicyHelper } from '@shared/policy.helper';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { buildResourceName } from '@shared/resource.helper';
import { SecretHelper } from '@shared/secret.helper';

/**
 * Construct for creating Lambda function for scheduler in Event Bridge
 */
export class SchedulerLambdaConstruct extends Construct {
  public readonly schedulerLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

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
    // Get the default and admin email addresses
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      'DefaultEmailAddress'
    );
    const adminEmailAddress = SecretHelper.getPlainTextParameter(
      this,
      'AdminEmailAddress'
    );

    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'SchedulerEvent', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.EVENT_BRIDGE}/weekly-top-products-report.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        ...dbInstance,
        DEFAULT_EMAIL_ADDRESS: defaultEmailAddress,
        ADMIN_EMAIL_ADDRESS: adminEmailAddress
      },
      functionName: buildResourceName(
        this, LAMBDA_FUNCTION_NAME.EVENT_BRIDGE_WEEKLY_REPORT
      )
    });

    // Add policy for Lambda function
    lambdaFunction.addToRolePolicy(
      PolicyHelper.sesSendEmail(this)
    );

    return lambdaFunction;
  }
}
