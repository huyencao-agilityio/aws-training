import dotenv from 'dotenv';

import { IamPolicyManager } from './iam-policy-manager';

dotenv.config();

const iamUserName = process.env.IAM_USER_DEVOPS || 'devops-user-name';

const policies = {
  customPolicies: [
    {
      name: 'AllowDevOpsAccessS3Policy',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:ListAllMyBuckets',
            Resource: '*'
          },
          {
            Effect: 'Allow',
            Action: [
              's3:CreateBucket',
              's3:DeleteBucket',
              's3:PutBucketPolicy',
              's3:GetBucketPolicy',
              's3:GetBucketLocation',
              's3:ListBucket',
              's3:GetBucketLogging',
              's3:PutBucketLogging',
              's3:GetLifecycleConfiguration',
              's3:PutLifecycleConfiguration',
              's3:PutEncryptionConfiguration'
            ],
            Resource: 'arn:aws:s3:::*'
          }
        ]
      }
    },
    {
      name: 'AllowDevOpsAccessCloudFrontPolicy',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cloudfront:CreateDistribution',
              'cloudfront:UpdateDistribution',
              'cloudfront:DeleteDistribution',
              'cloudfront:GetDistribution',
              'cloudfront:ListDistributions',
              'cloudfront:CreateInvalidation',
              'cloudfront:GetInvalidation'
            ],
            Resource: '*'
          }
        ]
      }
    }
  ],
  awsManagedPolicyArns: [
    'arn:aws:iam::aws:policy/IAMUserChangePassword',
  ]
};

const manager = new IamPolicyManager();
manager.createAndApplyPolicies(iamUserName, policies);
