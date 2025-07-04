import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { IVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';

/**
 * Defines interface for the RDS Construct
 */
export interface RdsConstructProps {
  vpc: IVpc;
  securityGroup: ISecurityGroup;
}

/**
 * Defines interface for the CloudFront construct.
 * Used to configure a CloudFront distribution with a custom domain and certificate.
 */
export interface CloudFrontConstructProps {
  bucket: IBucket;
  lambdaFnVersion: IVersion;
}
