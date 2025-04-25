#!/usr/bin/env node
import 'dotenv/config';
import { App, pipelines, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';

import { CoreStage } from '../lib/stages/core-stage/index';
import { MonitoringStage } from '../lib/stages/monitoring-stage/index';
import { AppStage } from '../lib/stages/app-stage/index';

class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const githubAccount = process.env.GITHUB_ACCOUNT || '';
    const branch = process.env.BRANCH || '';

    const source = CodePipelineSource.gitHub(githubAccount, branch, {
      authentication: SecretValue.secretsManager('github-token'),
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'ecommerce-cdk-pipeline',
      synth: new ShellStep('Synth', {
        input: source,
        primaryOutputDirectory: '../cdk.out',
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    const environments = {
      staging: {
        env: { account: '149379632015', region: 'us-east-1' },
        stageName: 'staging',
      },
      prod: {
        env: { account: '149379632015', region: 'us-east-1' },
        stageName: 'prod',
      },
    };

    const stagingCoreStage = new CoreStage(this, 'StagingCore', {
      stageName: environments.staging.stageName,
      env: environments.staging.env,
    });
    pipeline.addStage(stagingCoreStage);

    // const stagingAppStage = new AppStage(this, 'StagingApp', {
    //   stageName: environments.staging.stageName,
    //   env: environments.staging.env
    // });
    // pipeline.addStage(stagingAppStage);

    const stagingMonitoringStage = new MonitoringStage(this, 'StagingMonitoring', {
      stageName: environments.staging.stageName,
      env: environments.staging.env
    });
    pipeline.addStage(stagingMonitoringStage);

    // Prod Environment
    const prodCoreStage = new CoreStage(this, 'ProdCore', {
      stageName: environments.prod.stageName,
      env: environments.prod.env,
    });
    pipeline.addStage(prodCoreStage, {
      pre: [new pipelines.ManualApprovalStep('PromoteToProd')],
    });

    // const prodAppStage = new AppStage(this, 'ProdApp', {
    //   stageName: environments.prod.stageName,
    //   env: environments.prod.env
    // });
    // pipeline.addStage(prodAppStage);

    const prodMonitoringStage = new MonitoringStage(this, 'ProdMonitoring', {
      stageName: environments.prod.stageName,
      env: environments.prod.env
    });
    pipeline.addStage(prodMonitoringStage);
  }
}

const app = new App();
// TODO: this to deploy the pipeline
// new PipelineStack(app, 'PipelineStack', {
//   env: { account: '149379632015', region: 'us-east-1' },
// });

// const coreStage = new CoreStage(app, 'StagingCore', {
//   stageName: 'staging',
//   env: { account: '149379632015', region: 'us-east-1' }
// });

new AppStage(app, 'StagingApp', {
  env: { account: '149379632015', region: 'us-east-1' }
});
