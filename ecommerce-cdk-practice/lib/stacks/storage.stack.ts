import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BUCKET_NAME } from '../../src/constants/bucket.constant';
import { StorageConstruct } from '../constructs/s3/storage.construct';

/**
 * StorageStack is responsible for provisioning all storage resources
 * for the application.
 */
export class StorageStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const storageConstruct = new StorageConstruct(this, 'StorageConstruct', {
      bucketName: BUCKET_NAME,
    });

    new CfnOutput(this, 'BucketNameOutput', {
      value: storageConstruct.bucket.bucketName,
      exportName: 'BucketName',
    });
  }
}
