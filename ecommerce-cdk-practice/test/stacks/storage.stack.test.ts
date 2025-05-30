import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { StorageStack } from '@stacks/storage.stack';

describe('TestStorageStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new storage stack
    const storageStack = new StorageStack(app, 'TestStorageStack', {});

    template = Template.fromStack(storageStack);
  });

  it('should create an S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });
});
