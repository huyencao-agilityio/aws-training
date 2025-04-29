import { StackProps } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

/**
 * Defines interface for the stack that need to related to User Pool
 */
export interface UserPoolStackProps extends StackProps {
  userPool: UserPool;
}
