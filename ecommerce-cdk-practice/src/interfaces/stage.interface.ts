import { StageProps } from 'aws-cdk-lib';

export interface BaseStageProps extends StageProps {
  stageName: string;
}
