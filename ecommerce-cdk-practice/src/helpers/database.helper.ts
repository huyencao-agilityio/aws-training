import { Fn } from 'aws-cdk-lib';
import 'dotenv/config';

import { DB_CONSTANTS } from '@constants/database.constant';

/**
 * Fetches the database configuration by reading environment variables and importing values for the host
 */
export const getDatabaseConfig = () => {
  const dbName = process.env.DB_NAME || '';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbUser= process.env.DB_USER || '';

  return {
    DB_HOST: Fn.importValue(DB_CONSTANTS.HOST),
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    DB_NAME: dbName,
  };
};
