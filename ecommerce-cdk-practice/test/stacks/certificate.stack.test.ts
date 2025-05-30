import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

import { CertificateStack } from '@stacks/certificate.stack';

describe('TestCertificateStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Get hosted zone from existing hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'ecommerce-app.click',
      }
    );

    // Create new certificate stack
    const certificateStack = new CertificateStack(
      app,
      'TestCertificateStack',
      {
        hostedZone
      }
    );

    template = Template.fromStack(certificateStack);
  });

  it('should create a Certificate', () => {
    template.resourceCountIs('AWS::CertificateManager::Certificate', 1);
  });
});
