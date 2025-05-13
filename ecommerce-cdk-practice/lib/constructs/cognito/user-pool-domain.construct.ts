import { CnameRecord } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { UserPoolDomainConstructProps } from '@interfaces/construct.interface';

/**
 * Defines a construct that creates a Route 53 CNAME record pointing
 * to a Cognito custom domain endpoint
 */
export class UserPoolDomainConstruct extends Construct{
  constructor(scope: Construct, id: string, props: UserPoolDomainConstructProps) {
    super(scope, id);

    const { hostedZone, domainName, cognitoDomain } = props;

    // Get the CloudFront endpoint that Cognito assigns
    const cloudFrontEndpoint = cognitoDomain.cloudFrontEndpoint;
    // Get record name from domain name
    const recordName = domainName?.split('.')[0] || '';

    // Add Route 53 record pointing to the Cognito domain
    new CnameRecord(this, 'CognitoCnameRecord', {
      zone: hostedZone,
      recordName,
      domainName: cloudFrontEndpoint,
    });
  }
}
