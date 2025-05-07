import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Function,
  Runtime,
  Code,
  Version
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { BaseConstructProps } from '@interfaces/construct.interface';

/**
 * Construct for creating Lambda function for resize image in Lambda@Edge
 */
export class ResizeImageLambdaConstruct extends Construct {
  public readonly resizeImageLambda: Function;
  public readonly currentVersion: Version;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Create the Lambda function for product retrieval
    this.resizeImageLambda = new Function(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'resize-image.handler',
      code: Code.fromAsset('dist/src/lambda-handler/cloudfront/', {
        exclude: ['**/*', '!resize-image.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(30)
    });

    // Add IAM role policy for Lambda function
    this.resizeImageLambda.addToRolePolicy(new PolicyStatement({
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

    this.resizeImageLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:DeleteObject',
        's3:PutObject',
      ],
      resources: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    }));

    // Get version for Lambda function
    this.currentVersion = this.resizeImageLambda.currentVersion;
  }
}
