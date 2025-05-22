import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  CorsRule,
  HttpMethods
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Define the construct to create new S3 bucket
 */
export class StorageConstruct extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create new bucket on S3
    this.bucket = this.createBucket();
  }

  /**
   * Create a new S3 bucket
   *
   * @param bucketName - The name of the bucket to create
   * @returns The created bucket instance
   */
  createBucket(): Bucket {
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
    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: buildResourceName(this, BUCKET_NAME),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: corsRules,
    });

    return bucket;
  }
}
