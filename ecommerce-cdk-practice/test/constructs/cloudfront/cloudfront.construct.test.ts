import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  CloudFrontConstruct
} from '@constructs/cloudfront/cloudfront.construct';
import { buildResourceName } from '@shared/resource.helper';
import { BUCKET_NAME } from '@constants/bucket.constant';

describe('CloudFrontConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestCloudFrontStack', {
      env: { region: 'us-east-1' },
    });

    const lambdaFunction = new Function(stack, 'TestLambda', {
      functionName: 'test-lambda',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {};'),
    });

    const certificate = new Certificate(stack, 'TestCertificate', {
      domainName: '*.example.com',
    });

    // Need to mock bucket to test origin domain name in CloudFront
    Bucket.fromBucketAttributes(stack, 'FromBucketName', {
      bucketName: buildResourceName(stack, BUCKET_NAME),
      region: 'us-east-1',
      bucketRegionalDomainName: `
        ${buildResourceName(stack, BUCKET_NAME)}.s3.us-east-1.amazonaws.com
      `,
    });

    new CloudFrontConstruct(stack, 'TestCloudFrontConstruct', {
      lambdaFunction,
      certificate,
      domainName: 'cdn.example.com'
    });

    template = Template.fromStack(stack);
  });

  it('should create exactly one distribution', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);

  });

  // Two origin access control including
  //  + OAC for S3 bucket
  //  + OAC for CloudFront distribution
  it('should create two origin access control', () => {
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 2);
  });

  it('should create OAC with correct properties', () => {
    template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
      OriginAccessControlConfig: {
        Name: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
        Description: 'OAC for CloudFront to access S3',
        OriginAccessControlOriginType: 's3',
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4'
      }
    });
  });

  it('should add OAC to CloudFront distribution', () => {

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Origins:[
          {
            DomainName: Match.stringLikeRegexp(
              '^ecommerce-.*-dev\\.s3\\.us-east-1\\.amazonaws\\.com$'
            ),
            S3OriginConfig:{
              OriginAccessIdentity: ''
            },
            OriginAccessControlId: Match.anyValue(),
          }
        ]
      },
    });
  });

  it('should create CloudFront with correct domain name', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: [
          'cdn.example.com'
        ]
      }
    });
  });

  it('should add certificate to CloudFront', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        ViewerCertificate: {
          AcmCertificateArn: Match.anyValue()
        },
      }
    });
  });

  it('should configure cache policy for CloudFront', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: 'redirect-to-https',
          // Cache with CachingOptimized
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
        },
      },
    });
  });

  test('should associate Lambda@Edge with CloudFront distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          LambdaFunctionAssociations: [
            {
              EventType: 'origin-response',
              LambdaFunctionARN: {
                Ref: Match.stringLikeRegexp('TestLambda.*Version.*'),
              },
            },
          ],
        },
      },
    });
  });

  it('should retain CloudFront distribution on stack deletion', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      DeletionPolicy: 'Retain',
    });
  });
});
