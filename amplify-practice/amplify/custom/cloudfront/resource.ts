import { Construct } from 'constructs';
import {
  Distribution,
  ViewerProtocolPolicy,
  CachePolicy,
  CfnOriginAccessControl,
  CfnDistribution,
  SigningBehavior,
  SigningProtocol,
  OriginAccessControlOriginType,
  LambdaEdgeEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import { CfnBucketPolicy, IBucket } from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { RemovalPolicy } from 'aws-cdk-lib';

import {
  CloudFrontConstructProps
} from '../../shared/interfaces/construct.interface';
import { buildResourceName } from '../../utils/resource.utils';
import { BUCKET_NAME } from '../../shared/constants/bucket.constant';
import { PolicyHelper } from '../../utils/policy.utils';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IVersion } from 'aws-cdk-lib/aws-lambda';

/**
 * Define the construct to create new CloudFront
 */
export class CloudFrontConstruct extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
    super(scope, id);

    const { bucket, lambdaFnVersion } = props;

    // Create new a distribution in CloudFront
    this.distribution = this.createDistribution(
      bucket,
      lambdaFnVersion
    );

    // Add bucket resource policy to allow CloudFront to access the bucket
    this.addBucketResourcePolicy(bucket);

    // this.addLambdaFunctionPolicy(lambdaFunction, bucket);
  }

  /**
   * Create a new origin access control
   *
   * @returns The origin access control
   */
  createOriginAccessControl(): CfnOriginAccessControl {
    const oac = new CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: buildResourceName(`${BUCKET_NAME}-oac`),
        description: 'OAC for CloudFront to access S3',
        originAccessControlOriginType: OriginAccessControlOriginType.S3,
        signingBehavior: SigningBehavior.ALWAYS,
        signingProtocol: SigningProtocol.SIGV4,
      },
    });

    return oac;
  }

  /**
   * Create a new CloudFront distribution
   *
   * @param certificate - The certificate to use for the distribution
   * @param lambdaFunction - The lambda function to use for the distribution
   * @param domainName - The domain name to use for the distribution
   * @returns The distribution
   */
  createDistribution(
    bucket: IBucket,
    lambdaFnVersion: IVersion
  ): Distribution {
    // Create OAC
    const oac = this.createOriginAccessControl();

    // Create distribution
    const distribution =  new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            functionVersion: lambdaFnVersion,
            eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
          },
        ],
      },
      comment: 'CloudFront for public image access via S3',
    });

    const cfnDistribution = distribution.node.defaultChild as CfnDistribution;

    // Add origin access control to the distribution
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.OriginAccessControlId',
      oac.getAtt('Id')
    );
    // Add origin access identity to the distribution
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity',
      ''
    );

    // Retains the CloudFront distribution when destroying the stack
    // This is necessary because Lambda@Edge functions are replicated globally
    // and require manual cleanup before the distribution can be deleted.
    cfnDistribution.applyRemovalPolicy(RemovalPolicy.RETAIN);

    return distribution;
  }

  /**
   * Add a resource policy to the bucket to allow CloudFront to access the bucket
   *
   * @param bucket - The bucket to add the resource policy
   */
  addBucketResourcePolicy(bucket: IBucket): CfnBucketPolicy {
    return PolicyHelper.cloudfrontS3Access(
      this,
      bucket.bucketName,
      'CloudFrontBucketPolicy',
      this.distribution.distributionArn
    );
  }

  // addLambdaFunctionPolicy(lambdaFunction: NodejsFunction, bucket: IBucket): void {
  //   lambdaFunction.addToRolePolicy(
  //     PolicyHelper.s3ObjectCrud(bucket.bucketName)
  //   );
  // }
}
