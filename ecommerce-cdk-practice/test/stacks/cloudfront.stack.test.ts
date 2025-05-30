import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

import { CloudFrontStack } from '@stacks/cloudfront.stack';

describe('TestCloudfrontStack', () => {
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
        zoneName: 'example.com',
      }
    );

    // Get certificate from existing certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestCertificate',
      'arn:aws:acm:us-east-1:123456789012:certificate/TestCertificate'
    );

    // Create new cloudfront stack
    const cloudfrontStack = new CloudFrontStack(
      app,
      'TestCloudfrontStack',
      {
        hostedZone,
        certificate,
        domainName: 'cdn.example.com'
      }
    );

    template = Template.fromStack(cloudfrontStack);
  });

  it('should create a Cloudfront', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  it('should create two records A and AAAA for Cloudfront Domain', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2);
  });

  it('should create a Lambda@Edge function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create output for Cloudfront Domain Name', () => {
    template.hasOutput('CloudFrontDistributionDomainName', {
      Value: {
        'Fn::GetAtt': Match.arrayWith([
          Match.stringLikeRegexp('.*CloudFrontDistribution.*'),
        ])
      },
    });
  });

  it('should create a policy statement for CloudFront distribution management', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cloudfront:UpdateDistribution',
              'cloudfront:CreateDistribution',
            ],
            Resource: [{
              'Fn::Join': Match.arrayWith([
                Match.arrayWith([{
                  Ref: Match.stringLikeRegexp('.*CloudFrontDistribution.*'),
                }])
              ])
            }]
          },
        ],
      },
    });
  });
});
