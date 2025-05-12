import { App } from 'aws-cdk-lib';
import 'dotenv/config';

import { StagingStage } from '../lib/stages/staging.stage';
import { ProductionStage } from '../lib/stages/production.stage';
import { TestingStage } from '../lib/stages/testing.stage';

import { ENVIRONMENTS } from '@constants/domain.constant';
import { AppEnvironment } from '@interfaces/app-env.interface';

const app = new App();
const AWS_ACCOUNT = process.env.AWS_ACCOUNT;

const environments: Record<string, AppEnvironment> = {
  staging: {
    env: {
      account: AWS_ACCOUNT,
      region: 'us-east-1'
    },
    stageName: 'staging',
    services: {
      apiGateway: ENVIRONMENTS.staging.apiGateway,
      cloudFront: ENVIRONMENTS.staging.cloudFront,
      cognito: ENVIRONMENTS.staging.cognito,
    },
  },
  prod: {
    env: {
      account: AWS_ACCOUNT,
      region: 'us-east-1'
    },
    stageName: 'prod',
  },
  testing: {
    env: {
      account: AWS_ACCOUNT,
      region: 'us-east-1'
    },
    stageName: 'prod',
  },
};

// Get the selected stage from context
const stage = app.node.tryGetContext('stage');

// Define the mapping between stage name and its corresponding class + environment
const stageConfigMap = {
  staging: {
    name: 'StagingStage',
    stageClass: StagingStage,
    env: environments.staging,
  },
  production: {
    name: 'ProductionStage',
    stageClass: ProductionStage,
    env: environments.prod,
  },
  testing: {
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
