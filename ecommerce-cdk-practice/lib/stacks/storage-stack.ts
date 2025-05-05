import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { StorageConstruct } from '../constructs/s3/storage.construct';

/**
 * StorageStack is responsible for provisioning all storage resources
 * for the application.
 */
export class StorageStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new StorageConstruct(this, 'StorageConstruct', {
      bucketName: 'cdk-ecommerce-user-assets',
    });
  }
}
