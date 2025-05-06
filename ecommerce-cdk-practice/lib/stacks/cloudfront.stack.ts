import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {
  CloudFrontConstruct
} from '../constructs/cloudfront/cloudfront.construct';

/**
 * Define the CloudFront stack
 */
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new CloudFrontConstruct(this, 'CloudFrontDistribution');
  }
}
