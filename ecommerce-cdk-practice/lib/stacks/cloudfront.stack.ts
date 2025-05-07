import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {
  CloudFrontConstruct
} from '../constructs/cloudfront/cloudfront.construct';
import { ResizeImageLambdaConstruct } from '../constructs/lambda/cloudfront';

/**
 * Define the CloudFront stack
 */
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create the Lambda function for resize image
    const resizeLambdaConstruct = new ResizeImageLambdaConstruct(
      this,
      'ResizeImageLambdaConstruct'
    );

    // Create CloudFront
    const cloudFrontConstruct = new CloudFrontConstruct(this, 'CloudFrontDistribution', {
      lambdaFunction: resizeLambdaConstruct.resizeImageLambda
    });

    // Create a CloudFormation output to export the domain name of the CloudFront Distribution
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: cloudFrontConstruct.distribution.distributionDomainName,
      description: 'The domain name of the CloudFront Distribution',
      exportName: 'CloudFrontDomainName',
    });
  }
}
