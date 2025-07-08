import { Stack } from 'aws-cdk-lib';
import { CfnPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { CfnBucketPolicy } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

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
   * @param defaultEmailAddress - The default email address to send the email to
   * @returns The policy statement for sending emails
   */
  static allowSesSendEmail(
    scope: Construct,
    defaultEmailAddress: string
  ): PolicyStatement {
    // Get the region and account of the stack
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ses:SendEmail'
      ],
      resources: [
        `arn:aws:ses:${region}:${account}:identity/*`
      ],
    });
  }

  /**
   * Create a policy statement for getting a secret value from the secret manager
   *
   * @param scope - The scope of the stack
   * @param secretName - The name of the secret
   * @returns The policy statement for getting a secret value from the secret manager
   */
  static allowSecretManagerGetValue(
    scope: Construct,
    secretName: string
  ): PolicyStatement {
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue'
      ],
      resources: [
        `arn:aws:secretsmanager:${region}:${account}:secret:${secretName}*`
      ],
    });
  }

  /**
   * Create a policy statement for EC2 access
   *
   * @returns The policy statement for EC2 access
   */
  static allowEc2Access(): PolicyStatement {
    return new PolicyStatement({
      actions: [
        'ec2:CreateNetworkInterface',
        'ec2:DescribeNetworkInterfaces',
        'ec2:DeleteNetworkInterface',
        'ec2:DescribeSecurityGroups',
        'ec2:DescribeSubnets',
        'ec2:DescribeVpcs'
      ],
      resources: ['*'],
    });
  }

  /**
   * Create a policy statement for accessing Cognito authentication
   *
   * @param scope - The scope of the stack
   * @param userPoolId - The ID of the user pool
   * @returns The policy statement for accessing Cognito authentication
   */
  static allowAccessCognitoAuth(scope: Construct, userPoolId: string) {
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      actions: [
        'cognito-idp:RespondToAuthChallenge',
        'cognito-idp:InitiateAuth',
      ],
      resources: [
        `arn:aws:cognito-idp:${region}:${account}:userpool/${userPoolId}`
      ],
    })
  }

  /**
   * Create a policy statement for CloudFront S3 access
   *
   * @param bucketArn - The ARN of the bucket
   * @param distributionArn - The ARN of the distribution
   * @returns The policy statement for CloudFront S3 access
   */
  static cloudfrontS3Access(
    scope: Construct,
    bucketName: string,
    policyName: string,
    distributionArn: string
  ): CfnBucketPolicy {
    return new CfnBucketPolicy(scope, policyName, {
      bucket: bucketName,
      policyDocument:{
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            's3:GetObject'
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}/*`,
          ],
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Condition: {
            StringEquals: {
              'AWS:SourceArn': distributionArn,
            }
          }
        }]
      }
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
   * Create a policy statement for S3 object CRUD operations
   *
   * @param bucketName - The name of the bucket
   * @returns The policy statement for S3 object CRUD operations
   */
  static s3ObjectCrud(scope: Construct, bucketName: string, lambdaFunction: NodejsFunction): CfnPolicy {
    return new CfnPolicy(scope, 'ResizeImageS3Policy', {
      policyName: 'ResizeImageS3AccessPolicy',
      roles: [lambdaFunction.role!.roleName],
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
            ],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
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
    policyName: string,
    roleName: string,
    distributionArn: string
  ): CfnPolicy {
    return new CfnPolicy(scope, policyName, {
      policyName: policyName,
      roles: [ roleName ],
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cloudfront:UpdateDistribution',
              'cloudfront:CreateDistribution',
            ],
            Resource: [
              distributionArn,
            ],
          },
        ],
      },
    });
  }
}
