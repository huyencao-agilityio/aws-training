import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { DOMAIN_NAME } from '@constants/domain.constant';

/**
 * Define the construct to get hosted zone on route 53
 */
export class HostedZoneConstruct extends Construct {
  public readonly hostedZone: IHostedZone;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Get the hosted zone on Route 53
    this.hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: DOMAIN_NAME,
    });
  }
}
