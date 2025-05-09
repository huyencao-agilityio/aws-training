import { Environment } from 'aws-cdk-lib/core';

/**
 * Defines interface for app environment
 */
export interface AppEnvironment {
  env: Environment;
  stageName: string;
  domainName?: string;
  recordName?: string;
  basePathApi?: string;
}
