import { UserPool, UserPoolProps } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';

export interface LambdaConstructProps {
  librariesLayer: ILayerVersion;
}
export interface UserPoolLambdaConstructProps extends LambdaConstructProps {
  userPool: UserPool;
}

export interface UserPoolConstructProps extends LambdaConstructProps {
  region: string;
}

// export interface PreSignUpLambdaConstructProps extends LambdaConstructProps {
//   userPool: UserPool;
// }
