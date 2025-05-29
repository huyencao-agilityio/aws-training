import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  CloudFrontDomainConstruct
} from '@constructs/cloudfront/cloudfront-domain.construct';

describe('TestCloudFrontDomainConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestCloudFrontDomainStack');

    // Get hosted zone from existing hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'example.com',
      }
    );

    // Get bucket from existing bucket
    const bucket = Bucket.fromBucketName(stack, 'TestBucket', 'test-bucket');

    // Create distribution
    const distribution = new Distribution(
      stack,
      'TestCloudFrontDistribution',
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(bucket)
        },
      }
    );

    // Create cloudfront domain construct
    new CloudFrontDomainConstruct(stack, 'TestCloudFrontDomainConstruct', {
      hostedZone,
      domainName: 'cdn.example.com',
      distribution
    });

    template = Template.fromStack(stack);
  });

  it('should create two records', () => {
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
            Match.stringLikeRegexp('.*TestCloudFrontDistribution.*'),
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
            Match.stringLikeRegexp('.*TestCloudFrontDistribution.*'),
            'DomainName',
          ],
        }
      }
    });
  });
});
