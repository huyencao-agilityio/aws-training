import { StageProps } from 'aws-cdk-lib';

export interface BaseStageProps extends StageProps {
  domainName?: string;
  recordName?: string;
  basePathApi?: string;
}
