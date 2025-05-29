import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  CloudFrontConstruct
} from '@constructs/cloudfront/cloudfront.construct';

describe('CloudFrontConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    const lambdaFunction = new NodejsFunction(stack, 'LambdaFunction', {
      functionName: 'test-lambda',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {};'),
    });

    const certificate = new Certificate(stack, 'Certificate', {
      domainName: '*.example.com',
    });

    new CloudFrontConstruct(stack, 'CloudFrontConstruct', {
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
                Ref: Match.stringLikeRegexp('LambdaFunction.*Version.*'),
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

  it('should add resource policy to bucket', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: [{
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::ecommerce-user-assets-dev/*',
          Principal: {
            Service: 'cloudfront.amazonaws.com'
          },
          Condition: {
            StringEquals: {
              'AWS:SourceArn': {
                'Fn::Join': [
                  '',
                  [
                    'arn:aws:cloudfront::123456789012:distribution/',
                    {
                      Ref: Match.stringLikeRegexp('CloudFrontDistribution.*')
                    }
                  ]
                ]
              }
            }
          }
        }]
      }
    });
  });
});
