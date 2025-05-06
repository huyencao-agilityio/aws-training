import { Construct } from 'constructs';
import {
  Distribution,
  ViewerProtocolPolicy,
  CachePolicy,
  CfnOriginAccessControl,
  CfnDistribution,
  LambdaEdgeEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import { ResizeImageLambdaConstruct } from '../lambda/cloudfront/resize-image.construct';
import { BUCKET_NAME } from '../../../src/constants/bucket.constant';

/**
 * Define the construct to create new CloudFront
 */
export class CloudFrontConstruct extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the Lambda function for resize image
    const resizeLambdaConstruct = new ResizeImageLambdaConstruct(
      this,
      'ResizeImageLambdaConstruct'
    );

    const bucket = Bucket.fromBucketName(this, 'FromBucketName', BUCKET_NAME);

    // Create Origin Access Control (OAC
    const oac = new CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: `${BUCKET_NAME}-OAC`,
        description: 'OAC for CloudFront to access S3',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    // Create new a distribution in CloudFront
    this.distribution = new Distribution(this, 'CloudFrontDist', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            functionVersion: resizeLambdaConstruct.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
          },
        ],
      },
      comment: 'CloudFront for public image access via S3',
    });

    const cfnDistribution = this.distribution.node.defaultChild as CfnDistribution;
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.getAtt('Id'));
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');
  }
}
