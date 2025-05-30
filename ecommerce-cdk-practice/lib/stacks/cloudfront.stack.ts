import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseStackProps } from '@interfaces/stack.interface';
import {
  CloudFrontConstruct
} from '@constructs/cloudfront/cloudfront.construct';
import { ResizeImageLambdaConstruct } from '@constructs/lambda/cloudfront';
import {
  CloudFrontDomainConstruct
} from '@constructs/cloudfront/cloudfront-domain.construct';
import { PolicyHelper } from '@shared/policy.helper';

/**
 * Define the CloudFront stack
 */
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const {
      hostedZone,
      domainName,
      certificate
    } = props;

    // Create the Lambda function for resize image
    const { resizeImageLambda} = new ResizeImageLambdaConstruct(
      this,
      'ResizeImageLambdaConstruct',
      {}
    );

    // Create CloudFront construct
    const { distribution } = new CloudFrontConstruct(
      this,
      'CloudFrontDistribution',
      {
        lambdaFunction: resizeImageLambda,
        certificate,
        domainName
      }
    );

    // Add IAM role policy for Lambda function
    PolicyHelper.cloudfrontManageDistribution(
      this,
      'CloudFrontManageDistribution',
      resizeImageLambda.role!.roleName,
      distribution.distributionArn
    );

    // Custom domain for cloudfront
    new CloudFrontDomainConstruct(this, 'CloudFrontDomainConstruct', {
      hostedZone: hostedZone!,
      domainName: domainName!,
      distribution
    });

    // Create a CloudFormation output to export the domain name of the CloudFront Distribution
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'The domain name of the CloudFront Distribution'
    });
  }
}
