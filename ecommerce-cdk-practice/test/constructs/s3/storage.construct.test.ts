import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { StorageConstruct } from '@constructs/s3/storage.construct';

describe('StorageConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Create Storage Construct
    new StorageConstruct(stack, 'TestStorageConstruct');

    template = Template.fromStack(stack);
  });

  it('should create an S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  it('should create an S3 bucket with correct name format', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
    });
  });

  it('should configure BlockPublicAccess to BLOCK_ALL', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it('should configure CORS rules correctly', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      CorsConfiguration: {
        CorsRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: [
              'GET',
              'POST',
              'PUT',
              'DELETE'
            ],
            AllowedOrigins: ['*'],
            ExposedHeaders: [],
          },
        ],
      },
    });
  });
});
