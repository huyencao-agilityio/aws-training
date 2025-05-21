import { App } from 'aws-cdk-lib';
import 'dotenv/config';

import { StagingPipelineStack } from '@pipelines/staging.pipeline';
import { ProductionPipelineStack } from '@pipelines/production.pipeline';
import { DevStage } from '@stages/dev.stage';
import { StageName } from '@enums/stage-name.enum';
import { AppEnvironment } from '@interfaces/app-env.interface';
import { ENVIRONMENTS } from '@constants/domain.constant';
import { StageNameType } from '@app-types/stage.type';

const app = new App();

const env =  {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

// Define environment-specific configuration
const stageConfig: Record<StageName, AppEnvironment> = {
  [StageName.STAGING]: {
    env,
    stageName: StageName.STAGING,
    services: {
      apiGateway: ENVIRONMENTS.staging.apiGateway,
      cloudFront: ENVIRONMENTS.staging.cloudFront,
      cognito: ENVIRONMENTS.staging.cognito,
    },
  },
  [StageName.PROD]: {
    env,
    stageName: StageName.PROD,
    services: {
      apiGateway: ENVIRONMENTS.prod.apiGateway,
      cloudFront: ENVIRONMENTS.prod.cloudFront,
      cognito: ENVIRONMENTS.prod.cognito,
    },
  },
  [StageName.DEV]: {
    env,
    stageName: StageName.DEV,
    services: {
      apiGateway: ENVIRONMENTS.dev.apiGateway,
      cloudFront: ENVIRONMENTS.dev.cloudFront,
      cognito: ENVIRONMENTS.dev.cognito,
    },
  },
};

// Define the stage map for the different environments
const stageMap: Record<StageNameType, () => void> = {
  dev: () => new DevStage(app, 'DevStage', stageConfig[StageName.DEV]),
  staging: () => new StagingPipelineStack(app, 'StagingPipelineStack', {
    env,
    stage: stageConfig[StageName.STAGING],
  }),
  prod: () => new ProductionPipelineStack(app, 'ProductionPipelineStack', {
    env,
    stage: stageConfig[StageName.PROD],
  }),
};

// Get the environment type from the environment variable
const stageName: StageNameType = app.node.tryGetContext('stage') || 'dev';

// Initialize the stage
stageMap[stageName]();
