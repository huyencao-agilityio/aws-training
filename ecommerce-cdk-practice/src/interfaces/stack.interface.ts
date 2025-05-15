import { StackProps } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import { AppEnvironment } from './app-env.interface';

/**
 * Defines interface for the base stack properties
 */
export interface BaseStackProps extends StackProps {
  domainName: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
}

/**
 * Defines interface for the CloudFront stack properties
 */
export interface CloudFrontStackProps extends BaseStackProps {
  bucket: Bucket;
}

/**
 * Defines interface for the stack that need to related to User Pool
 */
export interface ApiStackProps extends BaseStackProps {
  userPool: UserPool;
  basePathApi?: string;
  stage?: string;
}

/**
 * Defines interface for the RDS stack
 */
export interface PostgresRdsStackProps extends StackProps {
  vpc: Vpc;
  securityGroup: SecurityGroup;
}

/**
 * Defines interface for the Certificate Stack
 */
export interface CertificateStackProps extends StackProps {
  hostedZone: IHostedZone;
}

/**
 *Defines interface for the Pipeline Stack
 */
export interface PipelineStackProps extends StackProps {
  stage: AppEnvironment;
}
