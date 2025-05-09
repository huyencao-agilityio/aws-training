import { App } from 'aws-cdk-lib';

import { StagingStage } from '../lib/stages/staging.stage';
import { ProductionStage } from '../lib/stages/production.stage';
import { TestingStage } from '../lib/stages/testing.stage';

import { ENVIRONMENTS } from '@constants/domain.constant';
import { AppEnvironment } from '@interfaces/app-env.interface';

const app = new App();

const environments: Record<string, AppEnvironment> = {
  staging: {
    env: { account: '149379632015', region: 'us-east-1' },
    stageName: 'staging',
    domainName: ENVIRONMENTS.staging.domainName,
    recordName: ENVIRONMENTS.staging.recordName,
    basePathApi: ENVIRONMENTS.staging.basePathApi
  },
  prod: {
    env: { account: '149379632015', region: 'us-east-1' },
    stageName: 'prod',
  },
  testing: {
    env: { account: '149379632015', region: 'us-east-1' },
    stageName: 'prod',
  },
};

new StagingStage(app, 'StagingStage', environments.staging);
new ProductionStage(app, 'ProductionStage', environments.prod);
new TestingStage(app, 'TestingStage', environments.testing);
