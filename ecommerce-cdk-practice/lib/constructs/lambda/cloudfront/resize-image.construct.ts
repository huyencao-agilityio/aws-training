import path from 'path';

import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Function,
  Runtime,
  Version,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { BaseConstructProps } from '@interfaces/construct.interface';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER
} from '@constants/lambda.constant';

/**
 * Construct for creating Lambda function for resize image in Lambda@Edge
 */
export class ResizeImageLambdaConstruct extends Construct {
  public readonly resizeImageLambda: Function;
  public readonly currentVersion: Version;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    // Create the Lambda function for resize image
    this.resizeImageLambda = this.createResizeImageLambdaFunction();
    // Get version for Lambda function
    this.currentVersion = this.resizeImageLambda.currentVersion;
  }

  /**
   * Create the Lambda function for resize image
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for resize image
   */
  createResizeImageLambdaFunction(): Function {
    // Create the Lambda function for resize image
    const lambdaFunction = new NodejsFunction(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.CLOUDFRONT}/resize-image.ts`
      ),
      bundling: {
        forceDockerBundling: true,
        externalModules: [],
        nodeModules: ['sharp', 'aws-sdk', '@types/aws-lambda']
      },
      timeout: Duration.seconds(30)
    });

    // Add IAM role policy for Lambda function
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'lambda:GetFunction',
        'lambda:EnableReplication',
        'lambda:DisableReplication',
        'cloudfront:UpdateDistribution',
        'cloudfront:CreateDistribution',
      ],
      resources: ['*'],
    }));

    lambdaFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:DeleteObject',
        's3:PutObject',
      ],
      resources: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    }));

    return lambdaFunction;
  }
}
