import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import {
  CertificateConstruct
} from '@constructs/certificate/certificate.construct';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

describe('TestCertificateConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get hosted zone from existing hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z01234567890123456789',
        zoneName: 'ecommerce-app.click'
      }
    );

    // Create Certificate Construct
    new CertificateConstruct(stack, 'TestCertificateConstruct', {
      hostedZone
    });

    template = Template.fromStack(stack);
  });

  it('should create one certificate', () => {
    template.resourceCountIs('AWS::CertificateManager::Certificate', 1);
  });

  it('should create certificate with config', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: '*.ecommerce-app.click',
      ValidationMethod: 'DNS',
      DomainValidationOptions: [
        {
          DomainName: '*.ecommerce-app.click',
          HostedZoneId: 'Z01234567890123456789'
        }
      ]
    });
  });

  it('should add removal policy retain for certificate', () => {
    template.hasResource('AWS::CertificateManager::Certificate', {
      UpdateReplacePolicy: 'Retain',
      DeletionPolicy: 'Retain',
    });
  });
});
