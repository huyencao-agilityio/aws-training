import { LayerVersion } from 'aws-cdk-lib/aws-lambda';

/**
 * Defines interface for properties required to create the Auth Challenge Lambda function.
 */
export interface CreateAuthChallengeProps {
  librariesLayer: LayerVersion;
  defaultEmail: string;
  challengeCode: string;
}
