import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// import { AuthStack } from '../../stacks/auth/auth-stack';
import { RDSStack } from '../../stacks/rds-stack';
import { StorageStack } from '../../stacks/storage-stack';
import { VPCStack } from '../../stacks/vpc-stack';
import { Route53Stack } from '../../stacks/route53-stack';

export class CoreStage extends Stage {
  // public readonly authStack: AuthStack;
  public readonly rdsStack: RDSStack;
  public readonly storageStack: StorageStack;
  public readonly vpcStack: VPCStack;
  public readonly route53Stack: Route53Stack;

  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    // this.authStack = new AuthStack(this, 'AuthStack', {
    //   stackName: props.stageName,
    // });

    // this.rdsStack = new RDSStack(this, 'RDSStack', {
    //   stackName: props.stageName,
    // });

    // this.storageStack = new StorageStack(this, 'StorageStack', {
    //   stackName: props.stageName,
    // });

    // this.vpcStack = new VPCStack(this, 'VPCStack', {
    //   stackName: props.stageName,
    // });

    // this.route53Stack = new Route53Stack(this, 'VPCStack', {
    //   stackName: props.stageName,
    // });
  }
}
