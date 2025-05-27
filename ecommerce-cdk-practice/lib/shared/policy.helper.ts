import { Stack } from 'aws-cdk-lib';
import {
  Effect,
  PolicyStatement,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { BUCKET_NAME } from '@constants/bucket.constant';
import { ParameterKeys } from '@constants/parameter-keys.constant';

import { SecretHelper } from './secret.helper';
import { buildResourceName } from './resource.helper';

/**
 * Helper class for creating IAM policies
 */
export class PolicyHelper {
  /**
   * Get the region and account of the stack
   *
   * @param scope - The scope of the stack
   * @returns The region and account of the stack
   */
  static getAccountContext(scope: Construct){
    const stack = Stack.of(scope);

    return {
      region: stack.region,
      account: stack.account,
    };
  }

  /**
   * Create a policy statement for sending emails
   *
   * @param scope - The scope of the stack
   * @param email - The email address to send the email to
   * @returns The policy statement for sending emails
   */
  static sesSendEmail(scope: Construct): PolicyStatement {
    // Get the region and account of the stack
    const { region, account } = PolicyHelper.getAccountContext(scope);

    // Get the default email address
    const defaultEmailAddress = SecretHelper.getPlainTextParameter(
      scope,
      ParameterKeys.DefaultEmailAddress
    );

    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ses:SendEmail'
      ],
      resources: [
        `arn:aws:ses:${region}:${account}:identity/${defaultEmailAddress}`
      ],
    });
  }

  /**
   * Create a policy statement for the pipeline
   *
   * @returns The policy statement for the pipeline
   */
  static pipelineAccess(): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'route53:ListHostedZonesByName',
        'ec2:DescribeAvailabilityZones',
      ],
      // These AWS API actions do not support resource-level permissions,
      // so the resource must be set to '*' to grant the necessary access
      resources: ['*'],
    });
  }

  /**
   * Create a policy statement for sending messages to a queue
   *
   * @param resourceArn - The ARN of the resource
   * @returns The policy statement for sending messages to a queue
   */
  static sqsSendMessage(resourceArn: string): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'sqs:SendMessage'
      ],
      resources: [resourceArn]
    });
  }

  /**
   * Create a policy statement for adding a user to a group in Cognito
   *
   * @param userPoolArn - The ARN of the user pool
   * @returns The policy statement for adding a user to a group in Cognito
   */
  static cognitoAddUserToGroup(userPoolArn: string): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: [userPoolArn]
    });
  }

  /**
   * Create a policy statement for Cognito user management
   *
   * @param userPoolArn - The ARN of the user pool
   * @returns The policy statement for Cognito user management
   */
  static cognitoUserManagement(userPoolArn: string): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'cognito-idp:ListUsers',
        'cognito-idp:AdminLinkProviderForUser',
        'cognito-idp:AdminDeleteUser'
      ],
      resources: [userPoolArn],
    });
  }

  /**
   * Create a policy statement for putting objects in a bucket
   *
   * @param scope - The scope of the stack
   * @returns The policy statement for putting objects in a bucket
   */
  static s3PutObject(scope: Construct): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:PutObject'
      ],
      resources: [
        `arn:aws:s3:::${
          buildResourceName(scope, BUCKET_NAME)
        }/*`
      ],
    });
  }

  /**
   * Create a policy statement for S3 object CRUD operations
   *
   * @param scope - The scope of the stack
   * @returns The policy statement for S3 object CRUD operations
   */
  static s3ObjectCrud(scope: Construct): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
      ],
      resources: [
        `arn:aws:s3:::${
          buildResourceName(scope, BUCKET_NAME)
        }/*`
      ],
    });
  }

  /**
   * Create a policy statement for Lambda function access
   *
   * @param scope - The scope of the stack
   * @param lambdaFnName - The name of the Lambda function
   * @returns The policy statement for Lambda function access
   */
  static lambdaFunctionAccess(
    scope: Construct,
    lambdaFnName: string
  ): PolicyStatement {
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'lambda:GetFunction',
        'lambda:EnableReplication',
        'lambda:DisableReplication',
      ],
      resources: [
        `arn:aws:lambda:${region}:${account}:function:${lambdaFnName}:*`,
      ],
    });
  }

  /**
   * Create a policy statement for Lambda function invocation
   *
   * @param functionArn - The ARN of the Lambda function
   * @returns The policy statement for Lambda function invocation
   */
  static lambdaInvoke(functionArn: string): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'lambda:InvokeFunction'
      ],
      resources: [functionArn],
    });
  }

  /**
   * Create a policy statement for CloudFront S3 access
   *
   * @param bucketArn - The ARN of the bucket
   * @param distributionArn - The ARN of the distribution
   * @returns The policy statement for CloudFront S3 access
   */
  static cloudfrontS3Access(
    bucketArn: string,
    distributionArn: string
  ): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:GetObject'
      ],
      resources: [
        `${bucketArn}/*`
      ],
      principals: [
        new ServicePrincipal('cloudfront.amazonaws.com')
      ],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': distributionArn,
        },
      },
    });
  }

  /**
   * Create a policy statement for CloudFront distribution management
   *
   * @param scope - The scope of the stack
   * @param distributionId - The ID of the distribution
   * @returns The policy statement for CloudFront distribution management
   */
  static cloudfrontManageDistribution(
    scope: Construct,
    distributionId: string
  ): PolicyStatement {
    const { account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'cloudfront:UpdateDistribution',
        'cloudfront:CreateDistribution'
      ],
      resources: [
        `arn:aws:cloudfront::${account}:distribution/${distributionId}`
      ],
    });
  }
}
