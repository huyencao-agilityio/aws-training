import { Construct } from 'constructs';

import { BaseStageProps } from '@interfaces/stage.interface';

import { BaseStage } from './base.stage';

/**
 * StagingStage represents the deployment stage for the staging environment
 */
export class StagingStage extends BaseStage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);
  }
}
