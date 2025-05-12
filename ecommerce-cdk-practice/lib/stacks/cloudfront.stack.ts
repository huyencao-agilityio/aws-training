import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { getLibrariesLayer } from '@helpers/layer.helper';
import { BaseStackProps } from '@interfaces/stack.interface';

import {
  CloudFrontConstruct
} from '../constructs/cloudfront/cloudfront.construct';
import { ResizeImageLambdaConstruct } from '../constructs/lambda/cloudfront';
import {
  CloudFrontDomainConstruct
} from '../constructs/cloudfront/cloudfront-domain.construct';

/**
 * Define the CloudFront stack
 */
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const {
      hostedZone,
      domainName,
      recordName,
      certificate,
    } = props;

    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Create the Lambda function for resize image
    const resizeLambdaConstruct = new ResizeImageLambdaConstruct(
      this,
      'ResizeImageLambdaConstruct', {
        librariesLayer
      }
    );

    // Create CloudFront construct
    const cloudFrontConstruct = new CloudFrontConstruct(
      this,
      'CloudFrontDistribution',
      {
        lambdaFunction: resizeLambdaConstruct.resizeImageLambda,
        certificate,
        domainName
      }
    );

    // Custom domain for cloudfront
    new CloudFrontDomainConstruct(this, 'CloudFrontDomainConstruct', {
      hostedZone: hostedZone!,
      recordName: recordName!,
      distribution: cloudFrontConstruct.distribution
    });

    // Create a CloudFormation output to export the domain name of the CloudFront Distribution
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: cloudFrontConstruct.distribution.distributionDomainName,
      description: 'The domain name of the CloudFront Distribution',
      exportName: 'CloudFrontDomainName',
    });
  }
}
