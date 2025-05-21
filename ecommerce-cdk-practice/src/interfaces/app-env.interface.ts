import { Environment } from 'aws-cdk-lib/core';

import { StageNameType } from '@app-types/stage.type';

/**
 * Define the interface for an individual service in a specific environment
 */
export interface ServiceEnvironment {
  domainName?: string;
  recordName?: string;
  basePathApi?: string;
  stage?: string;
}

/**
 * Defines interface for the overall application environment configuration
 */
export interface AppEnvironment {
  env: Environment;
  stageName: StageNameType;
  services?: {
    apiGateway?: ServiceEnvironment;
    cloudFront?: ServiceEnvironment;
    cognito?: ServiceEnvironment;
  };
}
