#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { LambdaLayerStack } from '../lib/lambda-layer-stack';

const app = new App();
new LambdaLayerStack(app, 'LambdaLayerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
