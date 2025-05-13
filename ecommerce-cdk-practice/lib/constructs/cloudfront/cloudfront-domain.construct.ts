import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

import {
  CloudFrontDomainConstructProps
} from '@interfaces/construct.interface';

/**
 * This class creates DNS records in Route 53 that point to a CloudFront distribution
 */
export class CloudFrontDomainConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: CloudFrontDomainConstructProps
) {
    super(scope, id);

    const { hostedZone, domainName, distribution } = props;
    // Get the record name
    const recordName = domainName?.split('.')[0] || '';

    // Create an A record in Route 53 pointing to the CloudFront distribution
    new ARecord(this, 'CloudFrontAliasRecord', {
      zone: hostedZone!,
      recordName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    // Create an AAAA record in Route 53 pointing to the CloudFront distribution
    new AaaaRecord(this, 'CloudFrontAAAAliasRecord', {
      zone: hostedZone!,
      recordName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
