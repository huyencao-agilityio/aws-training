import { StackProps } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

/**
 * Defines interface for the stack that need to related to User Pool
 */
export interface UserPoolStackProps extends StackProps {
  userPool: UserPool;
}

/**
 * Defines interface for the RDS stack
 */
export interface PostgresRdsStackProps extends StackProps {
  vpc: Vpc;
  securityGroup: SecurityGroup;
}
