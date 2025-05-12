import { App } from 'aws-cdk-lib';
import 'dotenv/config';

import { StagingStage } from '../lib/stages/staging.stage';
import { ProductionStage } from '../lib/stages/production.stage';
import { TestingStage } from '../lib/stages/testing.stage';

import { ENVIRONMENTS } from '@constants/domain.constant';
import { AppEnvironment } from '@interfaces/app-env.interface';
import { StageName } from '@enums/stage-name.enum';

const app = new App();

// Common AWS environment config
const defaultAwsEnv = {
  account: process.env.AWS_ACCOUNT,
  region: process.env.AWS_REGION,
};

// Define environment-specific configuration
const environments: Record<StageName, AppEnvironment> = {
  [StageName.STAGING]: {
    env: defaultAwsEnv,
    stageName: StageName.STAGING,
    services: {
      apiGateway: ENVIRONMENTS.staging.apiGateway,
      cloudFront: ENVIRONMENTS.staging.cloudFront,
      cognito: ENVIRONMENTS.staging.cognito,
    },
  },
  [StageName.PROD]: {
    env: defaultAwsEnv,
    stageName: StageName.PROD,
  },
  [StageName.TESTING]: {
    env: defaultAwsEnv,
    stageName: StageName.TESTING,
  },
};

// Get the selected stage from context
const stage = app.node.tryGetContext('stage');

// Define the mapping between stage name and its corresponding class + environment
const stageConfigMap = {
  [StageName.STAGING]: {
    name: 'StagingStage',
    stageClass: StagingStage,
    env: environments.staging,
  },
  [StageName.PROD]: {
    name: 'ProductionStage',
    stageClass: ProductionStage,
    env: environments.prod,
  },
  [StageName.TESTING]: {
    name: 'TestingStage',
    stageClass: TestingStage,
    env: environments.testing,
  },
} as const;

// Get the config for the selected stage
const selectedConfig = stageConfigMap[stage as keyof typeof stageConfigMap];

// Throw error if invalid stage
if (!selectedConfig) {
  throw new Error(`Invalid or missing stage: ${stage}`);
}

// Create the corresponding stage
new selectedConfig.stageClass(app, selectedConfig.name, selectedConfig.env);
