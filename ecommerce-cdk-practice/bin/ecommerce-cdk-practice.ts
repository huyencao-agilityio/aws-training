import { App } from 'aws-cdk-lib';

import { StagingStage } from '../lib/stages/staging.stage';
import { ProductionStage } from '../lib/stages/production.stage';
import { TestingStage } from '../lib/stages/testing.stage';

const app = new App();

const environments = {
  staging: {
    env: { account: '149379632015', region: 'us-east-1' },
    stageName: 'staging',
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
