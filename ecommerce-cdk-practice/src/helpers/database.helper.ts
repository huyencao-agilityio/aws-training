import { Fn } from 'aws-cdk-lib';
import 'dotenv/config';

import { DB_CONSTANTS } from '@constants/database.constant';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

/**
 * Fetches the database configuration by reading environment variables and importing values for the host
 */
export const getDatabaseConfig = (scope: Construct): Record<string, string> => {
  const dbPassword =  StringParameter.valueForStringParameter(
    scope,
    '/db/password'
  );
  const dbName =  StringParameter.valueForStringParameter(
    scope,
    '/db/name'
  );
  const dbUser =  StringParameter.valueForStringParameter(
    scope,
    '/db/user'
  );

  return {
    DB_HOST: Fn.importValue(DB_CONSTANTS.HOST),
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    DB_NAME: dbName,
  };
};
