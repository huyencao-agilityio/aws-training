import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HostedZoneConstruct } from '../constructs/route53/hosted-zone.construct';

export class Route53Stack extends Stack {
  public readonly hostedZoneConstruct: HostedZoneConstruct;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.hostedZoneConstruct = new HostedZoneConstruct(this, 'HostedZoneConstruct');
  }
}
