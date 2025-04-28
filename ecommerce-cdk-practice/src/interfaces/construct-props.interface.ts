import { UserPool, UserPoolProps } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';

/**
 * Defines interface for Lambda construct properties.
 */
export interface LambdaConstructProps {
  librariesLayer: ILayerVersion;
}

/**
 * Defines interface for Lambda constructs
 * that using Cognito User Pool.
 */
export interface UserPoolLambdaConstructProps extends LambdaConstructProps {
  userPool: UserPool;
}

/**
 * Defines interface for User Pool construct.
 */
export interface UserPoolConstructProps extends LambdaConstructProps {
  region: string;
}
