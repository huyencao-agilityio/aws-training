import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { VpcConstruct } from '../constructs/vpc/vpc.construct';

/**
 * VPCStack is responsible for provisioning VPC
 * for the application.
 */
export class VPCStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new VpcConstruct(this, 'VpcConstruct')
  }
}
