import { Construct } from 'constructs';
import {
  Distribution,
  ViewerProtocolPolicy,
  CachePolicy,
  CfnOriginAccessControl,
  CfnDistribution,
  LambdaEdgeEventType,
  SigningBehavior,
  SigningProtocol,
  OriginAccessControlOriginType,
} from 'aws-cdk-lib/aws-cloudfront';
import { RemovalPolicy } from 'aws-cdk-lib';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { CloudFrontConstructProps } from '@interfaces/construct.interface';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Define the construct to create new CloudFront
 */
export class CloudFrontConstruct extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
    super(scope, id);

    const { lambdaFunction, certificate, domainName, bucket } = props;

    // Create new a distribution in CloudFront
    this.distribution = this.createDistribution(
      certificate,
      lambdaFunction!,
      domainName
    );

    // Add bucket resource policy to allow CloudFront to access the bucket
    this.addBucketResourcePolicy(bucket);
  }

  /**
   * Create a new origin access control
   *
   * @returns The origin access control
   */
  createOriginAccessControl(): CfnOriginAccessControl {
    const oac = new CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: buildResourceName(this, `${BUCKET_NAME}-oac`),
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
    certificate: ICertificate,
    lambdaFunction: Function,
    domainName: string
  ): Distribution {
    // Get bucket name
    const bucket = Bucket.fromBucketName(this, 'FromBucketName', BUCKET_NAME);
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
            functionVersion: lambdaFunction!.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
          },
        ],
      },
      domainNames: [domainName],
      certificate: certificate,
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
  addBucketResourcePolicy(bucket: Bucket): void {
    // Add resource policy to the bucket
    bucket.addToResourcePolicy(
      PolicyHelper.cloudfrontS3Access(
        bucket.bucketArn,
        this.distribution.distributionArn
      )
    );
  }
}
