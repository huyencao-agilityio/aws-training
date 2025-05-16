import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { CertificateStackProps } from '@interfaces/stack.interface';
import {
  CertificateConstruct
} from '@constructs/certificate/certificate.construct';

export class CertificateStack extends Stack {
  public readonly certificateConstruct: CertificateConstruct;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { hostedZone } = props;

    this.certificateConstruct = new CertificateConstruct(this, 'CertificateConstruct', {
      hostedZone
    });
  }
}
