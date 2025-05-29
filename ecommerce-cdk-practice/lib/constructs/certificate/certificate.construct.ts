import { Construct } from 'constructs';
import {
  Certificate,
  CertificateValidation,
  ICertificate
} from 'aws-cdk-lib/aws-certificatemanager';
import { RemovalPolicy } from 'aws-cdk-lib';

import { DOMAIN_NAME } from '@constants/domain.constant';
import { CertificateConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create certificate for domain
 */
export class CertificateConstruct extends Construct {
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string, props: CertificateConstructProps) {
    super(scope, id);

    const { hostedZone } = props;

    // Create new certificate for domain
    this.certificate = new Certificate(this, 'Certificate', {
      domainName: `*.${DOMAIN_NAME}`,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    // Avoid remove certificate when destroy stack
    this.certificate.applyRemovalPolicy(RemovalPolicy.RETAIN);
  }
}
