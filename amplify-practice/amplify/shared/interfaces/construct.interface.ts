import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { IVpc } from 'aws-cdk-lib/aws-ec2';

/**
 * Defines interface for the RDS Construct
 */
export interface RdsConstructProps {
  vpc: IVpc;
  securityGroup: ISecurityGroup;
}
