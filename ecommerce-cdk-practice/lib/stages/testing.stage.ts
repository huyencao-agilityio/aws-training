import { Construct } from 'constructs';

import { BaseStageProps } from '@interfaces/stage.interface';

import { BaseStage } from './base.stage';

/**
 * TestingStage represents the deployment stage for the testing environment
 */
export class TestingStage extends BaseStage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);
  }
}
