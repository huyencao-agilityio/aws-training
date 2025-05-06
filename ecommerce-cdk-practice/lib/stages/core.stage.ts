import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RDSStack } from '../stacks/rds.stack';
import { StorageStack } from '../stacks/storage.stack';
import { VPCStack } from '../stacks/vpc.stack';
import { Route53Stack } from '../stacks/route53.stack';
import { CloudFrontStack } from '../stacks/cloudfront.stack';

/**
 * CoreStage is responsible for grouping and deploying all application stacks
 * such as S3, RDS, Route 53.
 */
export class CoreStage extends Stage {
  public readonly rdsStack: RDSStack;
  public readonly storageStack: StorageStack;
  public readonly vpcStack: VPCStack;
  public readonly route53Stack: Route53Stack;
  public readonly cloudFrontStack: CloudFrontStack;

  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const { stageName } = props;

    // this.rdsStack = new RDSStack(this, 'RDSStack', {
    //   stackName: props.stageName,
    // });

    this.storageStack = new StorageStack(this, 'StorageStack', {
      stackName: stageName,
    });

    this.cloudFrontStack = new CloudFrontStack(this, 'CloudFrontStack', {
      stackName: stageName
    });

    // this.vpcStack = new VPCStack(this, 'VPCStack', {
    //   stackName: props.stageName,
    // });

    // this.route53Stack = new Route53Stack(this, 'VPCStack', {
    //   stackName: props.stageName,
    // });
  }
}
