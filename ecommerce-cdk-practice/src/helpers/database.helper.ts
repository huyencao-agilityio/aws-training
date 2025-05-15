import { Fn, SecretValue } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

import { DB_CONSTANTS } from '@constants/database.constant';

/**
 * Fetches the database configuration by reading environment variables and importing values for the host
 */
export const getDatabaseConfig = (scope: Construct): Record<string, string> => {
  const secret = Secret.fromSecretNameV2(
    scope,
    `Secret${Math.random().toString(36).substring(2, 8)}`,
    'secret'
  );
  const dbPassword = secret.secretValueFromJson('db_password').unsafeUnwrap();

  const dbName = StringParameter.valueForStringParameter(
    scope,
    '/db/name'
  );
  const dbUser = StringParameter.valueForStringParameter(
    scope,
    '/db/user'
  );

  return {
    DB_HOST: Fn.importValue(DB_CONSTANTS.HOST),
    DB_USER: dbUser,
    DB_PASSWORD: SecretValue.unsafePlainText(dbPassword).unsafeUnwrap(),
    DB_NAME: dbName,
  };
};
