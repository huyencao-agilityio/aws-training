import { StackProps } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

/**
 * Defines the properties required to initialize the API stack.
 */
export interface ApiStackProps extends StackProps {
  userPool: UserPool;
}
