import { StageProps } from 'aws-cdk-lib';

import { ServiceEnvironment } from './app-env.interface';

/**
 * Defines interface for the base stage properties
 */
export interface BaseStageProps extends StageProps {
  services?: {
    apiGateway?: ServiceEnvironment;
    cloudFront?: ServiceEnvironment;
    cognito?: ServiceEnvironment;
  }
}
