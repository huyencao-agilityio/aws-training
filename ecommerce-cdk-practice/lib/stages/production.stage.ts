import { Construct } from 'constructs';

import { BaseStageProps } from '@interfaces/stage.interface';

import { BaseStage } from './base.stage';

/**
 * ProductionStage represents the deployment stage for the production environment
 */
export class ProductionStage extends BaseStage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);
  }
}
