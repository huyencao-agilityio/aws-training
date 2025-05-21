import { Construct } from 'constructs';

import { StageNameType } from '@app-types/stage.type';

/**
 * Define the interface for the pipeline options
 */
export interface PipelineOptions {
  scope: Construct;
  pipelineName: string;
  stageName: StageNameType;
}
