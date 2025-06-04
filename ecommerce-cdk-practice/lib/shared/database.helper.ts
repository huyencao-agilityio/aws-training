import { Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { DB_CONSTANTS } from '@constants/database.constant';
import { ParameterKeys } from '@constants/parameter-keys.constant';

import { SecretHelper } from './secret.helper';

/**
 * Fetches the database configuration by reading environment variables and importing values for the host
 */
export const getDatabaseConfig = (
  scope: Construct
): Record<string, string> => {
  // Get the database password, name, user from the SSM Parameter Store
  const dbPassword = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.DbPassword
  );
  const dbName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.DbName
  );
  const dbUser = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.DbUser
  );

  return {
    DB_HOST: Fn.importValue(DB_CONSTANTS.HOST),
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    DB_NAME: dbName,
  };
};
