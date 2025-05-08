import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

import { VpcConstruct } from '../constructs/vpc/vpc.construct';

/**
 * VPCStack is responsible for provisioning the Virtual Private Cloud (VPC)
 */
export class VPCStack extends Stack {
  public readonly vpc: Vpc;
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct');
    const {vpc, securityGroup } = vpcConstruct

    this.vpc = vpc;
    this.securityGroup = securityGroup;
  }
}
