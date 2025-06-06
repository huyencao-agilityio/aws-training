import dotenv from 'dotenv';

import { IamPolicyManager } from './iam-policy-manager';

dotenv.config();

const iamUserName = process.env.IAM_USER_DEVELOPER || 'developer-user-name';
const bucketName = process.env.BUCKET_NAME || 'my-bucket';

const policies = {
  customPolicies: [
    {
      name: 'AllowS3AccessPolicy',
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
              's3:ListBucket',
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject'
            ],
            Resource: [
              `arn:aws:s3:::${bucketName}`,
              `arn:aws:s3:::${bucketName}/*`
            ]
          }
        ]
      }
    },
    {
      name: 'AllowCloudFrontAccessPolicy',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cloudfront:ListDistributions'
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
