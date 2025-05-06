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

import { BUCKET_NAME } from '../../../src/constants/bucket.constant';
import { BaseConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create new CloudFront
 */
export class CloudFrontConstruct extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { lambdaFunction } = props;
    const bucket = Bucket.fromBucketName(this, 'FromBucketName', BUCKET_NAME);

    // Create Origin Access Control (OAC)
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
    this.distribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            functionVersion: lambdaFunction!.currentVersion,
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
