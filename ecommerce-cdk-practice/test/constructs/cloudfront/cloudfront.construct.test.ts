import { App, Fn, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  CloudFrontConstruct
} from '@constructs/cloudfront/cloudfront.construct';

describe('TestCloudFrontConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    // Get certificate from existing certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestFromCertificate',
      Fn.importValue('TestCertificate')
    );

    // Create Lambda Function
    const lambdaFunction = new NodejsFunction(stack, 'TestLambdaFunction', {
      functionName: 'test-lambda',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => {};'),
    });

    // Create CloudFront Construct
    new CloudFrontConstruct(stack, 'TestCloudFrontConstruct', {
      lambdaFunction,
      certificate,
      domainName: 'cdn.example.com'
    });

    template = Template.fromStack(stack);
  });

  it('should create one distribution', () => {
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
        Name: 'ecommerce-user-assets-oac-dev',
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
            DomainName: 'ecommerce-user-assets-dev.s3.us-east-1.amazonaws.com',
            S3OriginConfig:{
              OriginAccessIdentity: ''
            },
            OriginAccessControlId: Match.objectLike({
              'Fn::GetAtt': Match.arrayWith([
                Match.stringLikeRegexp('.*TestCloudFrontConstruct.*')
              ])
            }),
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
          AcmCertificateArn: {
            'Fn::ImportValue': Match.stringLikeRegexp('.*TestCertificate.*')
          }
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
                Ref: Match.stringLikeRegexp('.*TestLambdaFunction.*Version.*'),
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
          Action: [
            's3:GetObject',
          ],
          Resource: [
            'arn:aws:s3:::ecommerce-user-assets-dev/*',
          ],
          Principal: {
            Service: 'cloudfront.amazonaws.com'
          },
          Condition: {
            StringEquals: {
              'AWS:SourceArn': Match.objectLike({
                'Fn::Join': Match.arrayWith([
                  '',
                  Match.arrayWith([
                    Match.stringLikeRegexp(
                      ':cloudfront::123456789012:distribution/'
                    ),
                    {
                      Ref: Match.stringLikeRegexp(
                        '.*TestCloudFrontConstruct.*'
                      )
                    }
                  ])
                ])
              })
            }
          }
        }]
      }
    });
  });
});
