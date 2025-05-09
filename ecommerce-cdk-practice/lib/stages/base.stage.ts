import { BaseStageProps } from '@interfaces/stage.interface';
import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { getLibrariesLayer } from '@helpers/layer.helper';

import { ApiStack } from '../stacks/api.stack';
import { AuthStack } from '../stacks/auth.stack';
import { CloudFrontStack } from '../stacks/cloudfront.stack';
import { EventBridgeStack } from '../stacks/event-bridge.stack';
import { MonitoringStack } from '../stacks/monitoring.stack';
import { QueueStack } from '../stacks/queue.stack';
import { RdsStack } from '../stacks/rds.stack';
import { StorageStack } from '../stacks/storage.stack';
import { VPCStack } from '../stacks/vpc.stack';

/**
 * BaseStage is a class that groups common stacks used across different environments
 * such as development, staging, and production
 */
export class BaseStage extends Stage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);

    const { stageName } = props;

    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    const vpcStack = new VPCStack(this, 'VPCStack', {
      stackName: `${stageName}-vpc-stack`
    });

    new RdsStack(this, 'RDSStack', {
      stackName: `${stageName}-rds-stack`,
      vpc: vpcStack.vpc,
      securityGroup: vpcStack.securityGroup
    });

    new StorageStack(this, 'StorageStack', {
      stackName: `${stageName}-storage-stack`,
    });

    new CloudFrontStack(this, 'CloudFrontStack', {
      stackName: `${stageName}-cloudfront-stack`,
      librariesLayer
    });

    new QueueStack(this, 'QueueStack', {
      stackName: `${stageName}-queue-stack`,
      librariesLayer
    });

    const authStack = new AuthStack(this, 'AuthStack', {
      stackName: `${stageName}-auth-stack`,
      librariesLayer
    });

    const apiStack = new ApiStack(this, 'ApiStack', {
      stackName: `${stageName}-api-stack`,
      librariesLayer,
      userPool: authStack.userPoolConstruct.userPool
    });

    // Explicit dependency
    apiStack.addDependency(authStack);

    new EventBridgeStack(this, 'EventBridgeStack', {
      stackName: `${stageName}-event-bridge-stack`,
      librariesLayer
    });

    new MonitoringStack(this, 'MonitoringStack', {
      stackName: `${stageName}-monitoring-stack`
    });

  }
}
