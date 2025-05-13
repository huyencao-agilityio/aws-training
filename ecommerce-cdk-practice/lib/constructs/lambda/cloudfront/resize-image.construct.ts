import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Function,
  Runtime,
  Code,
  Version,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { BaseConstructProps } from '@interfaces/construct.interface';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

/**
 * Construct for creating Lambda function for resize image in Lambda@Edge
 */
export class ResizeImageLambdaConstruct extends Construct {
  public readonly resizeImageLambda: Function;
  public readonly currentVersion: Version;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Create the Lambda function for resize image
    this.resizeImageLambda = this.createResizeImageLambdaFunction(
      librariesLayer!
    );
    // Get version for Lambda function
    this.currentVersion = this.resizeImageLambda.currentVersion;
  }

  /**
   * Create the Lambda function for resize image
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for resize image
   */
  createResizeImageLambdaFunction(
    librariesLayer: ILayerVersion
  ): Function {
    const lambdaFunction = new Function(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'resize-image.handler',
      code: Code.fromAsset(LAMBDA_PATH.CLOUDFRONT, {
        exclude: ['**/*', '!resize-image.js'],
      }),
      layers: [librariesLayer!],
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
