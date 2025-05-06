import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  CorsRule,
  HttpMethods
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { StorageBucketConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create new S3 bucket
 */
export class StorageConstruct extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: StorageBucketConstructProps) {
    super(scope, id);

    const { bucketName } = props;
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
    this.bucket = new Bucket(this, 'S3Bucket', {
      bucketName: bucketName,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: corsRules,
    });
  }
}
