import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { MonitoringStack } from '../stacks/monitoring.stack';

/**
 * CoreStage is responsible for grouping and deploying all application stacks
 * related to monitoring.
 */
export class MonitoringStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const { stageName } = props;

    new MonitoringStack(this, 'MonitoringStack', {
      stackName: 'staging-monitoring'
    });
  }
}
