import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  CloudFrontDomainConstruct
} from '@constructs/cloudfront/cloudfront-domain.construct';

describe('CloudFrontDomainConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestCloudFrontDomainStack');

    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'HostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'example.com',
      }
    );

    const bucket = new Bucket(stack, 'TestBucket');

    const distribution = new Distribution(stack, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket)
      },
    });

    new CloudFrontDomainConstruct(stack, 'TestCloudFrontDomainConstruct', {
      hostedZone,
      domainName: 'cdn.example.com',
      distribution
    });

    template = Template.fromStack(stack);
  });

  it('should create exactly two records', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2);
  });

  it('should create A records with correct configuration', () => {
    // Check A Record
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'A',
      Name: 'cdn.example.com.',
      HostedZoneId: 'Z0344904LOXNYZARXRJA',
      AliasTarget: {
        DNSName: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('CloudFrontDistribution.*'),
            'DomainName',
          ],
        }
      }
    });
  });

  it('should create AAAA records with correct configuration', () => {
    // Check AAAA Record
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'AAAA',
      Name: 'cdn.example.com.',
      HostedZoneId: 'Z0344904LOXNYZARXRJA',
      AliasTarget: {
        DNSName: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('CloudFrontDistribution.*'),
            'DomainName',
          ],
        }
      }
    });
  });
});
