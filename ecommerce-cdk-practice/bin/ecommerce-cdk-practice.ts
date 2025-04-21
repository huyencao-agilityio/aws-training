#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { AuthStack } from '../lib/stacks/auth/auth-stack';

const app = new cdk.App();
new AuthStack(app, 'AuthStack', {
  env: {
    account: '149379632015',
    region: 'us-east-1',
  }
});
