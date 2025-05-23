import { App, Stack } from 'aws-cdk-lib';
import {Template } from 'aws-cdk-lib/assertions';

import {
  UserPoolDomainConstruct
} from '@constructs/cognito/user-pool-domain.construct';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

describe('UserPoolDomainConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestUserPoolDomainStack');

    // Init hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
      hostedZoneId: 'Z1234567890',
      zoneName: 'example.com',
    });

    // Init cognito domain
    const cognitoDomain = {
      cloudFrontEndpoint: 'cloudfront.example.com',
    } as any;

    // New user pool domain construct
    new UserPoolDomainConstruct(stack, 'TestUserPoolDomainConstruct', {
      hostedZone,
      domainName: 'auth.example.com',
      cognitoDomain
    });

    template = Template.fromStack(stack);
  });

  it('should create CNAME record', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 1);
  });

  it('should create CNAME record for Cognito Domain with correct configuration', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'CNAME',
      Name: 'auth.example.com.',
      ResourceRecords: ['cloudfront.example.com'],
      HostedZoneId: 'Z1234567890'
    });
  });
});
