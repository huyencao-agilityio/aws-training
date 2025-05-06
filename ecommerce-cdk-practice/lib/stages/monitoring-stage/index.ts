import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { MonitoringStack } from '../../stacks/monitoring.stack';

export class MonitoringStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    new MonitoringStack(this, 'MonitoringStack', {
      stackName: props.stageName
    });
  }
}
