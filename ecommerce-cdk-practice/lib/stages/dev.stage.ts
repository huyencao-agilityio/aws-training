import { Construct } from 'constructs';

import { BaseStageProps } from '@interfaces/stage.interface';

import { BaseStage } from './base.stage';

/**
 * DevStage represents the deployment stage for the dev environment
 */
export class DevStage extends BaseStage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);
  }
}
