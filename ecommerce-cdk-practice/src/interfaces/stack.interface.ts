import { StackProps } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';

/**
 * Defines interface for the stack that need to related to User Pool
 */
export interface ApiStackProps extends StackProps {
  userPool: UserPool;
  domainName?: string;
  recordName?: string;
  basePathApi?: string;
  hostedZone?: IHostedZone;
  certificate: ICertificate;
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
