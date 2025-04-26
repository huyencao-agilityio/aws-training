import { LayerVersion } from 'aws-cdk-lib/aws-lambda';

export interface CreateAuthChallengeProps {
  librariesLayer: LayerVersion;
  defaultEmail: string;
  challengeCode: string;
}
