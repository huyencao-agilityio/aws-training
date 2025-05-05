import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  CorsRule,
  HttpMethods
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { StorageBucketConstructProps } from '@interfaces/construct.interface';

export class StorageConstruct extends Construct {
  public readonly storageBucket: Bucket;

  constructor(scope: Construct, id: string, props: StorageBucketConstructProps) {
    super(scope, id);

    // Define CORS rule
    const corsRules: CorsRule[] = [
      {
        allowedMethods: [
          HttpMethods.GET,
          HttpMethods.POST,
          HttpMethods.PUT,
          HttpMethods.DELETE,
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        exposedHeaders: [],
      }
    ];

    // Create new bucket on S3
    this.storageBucket = new Bucket(this, 'StorageBucket', {
      bucketName: props.bucketName,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: corsRules,
    });
  }
}
