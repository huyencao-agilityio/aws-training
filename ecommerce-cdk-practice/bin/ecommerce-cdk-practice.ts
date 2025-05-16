import { App } from 'aws-cdk-lib';
import 'dotenv/config';

import { AppPipelineStack } from '@pipelines/app.pipeline';
import { TestingStage } from '@stages/testing.stage';
import { ProductionStage } from '@stages/production.stage';
import { StageName } from '@enums/stage-name.enum';
import { AppEnvironment } from '@interfaces/app-env.interface';
import { ENVIRONMENTS } from '@constants/domain.constant';
import { EnvType } from '@app-types/environment.type';

const app = new App();

const env =  {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

// Define environment-specific configuration
const stage: Record<StageName, AppEnvironment> = {
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
  },
  [StageName.TESTING]: {
    env,
    stageName: StageName.TESTING,
    services: {
      apiGateway: ENVIRONMENTS.testing.apiGateway,
      cloudFront: ENVIRONMENTS.testing.cloudFront,
      cognito: ENVIRONMENTS.testing.cognito,
    },
  },
};

// Define the stage map for the different environments
const stageMap: Record<EnvType, () => void> = {
  local: () => new TestingStage(app, 'TestingStage', stage[StageName.TESTING]),
  staging: () => new AppPipelineStack(app, 'AppPipelineStack', {
    env,
    stage: stage[StageName.STAGING],
  }),
  prod: () => new ProductionStage(app, 'ProductionStage', stage[StageName.PROD]),
};

// Get the environment type from the environment variable
const envType: EnvType = process.env.ENV as EnvType || 'staging';

// Initialize the stage
stageMap[envType]();
