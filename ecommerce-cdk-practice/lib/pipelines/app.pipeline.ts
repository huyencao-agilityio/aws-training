import { SecretValue, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  ShellStep
} from 'aws-cdk-lib/pipelines';
import 'dotenv/config';

import { PipelineStackProps } from '@interfaces/stack.interface';

import { StagingStage } from '../stages/staging.stage';

/**
 * The AppPipeline class defines the main CDK Stack responsible for
 * creating and managing the application's CI/CD pipeline
 * using AWS CodePipeline
 */
export class AppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { stage } = props;

    const branchName = process.env.BRANCH_NAME || 'develop';
    const repoName = process.env.REPO_NAME || '';
    const env = process.env.ENV || 'staging';

    const pipeline = new CodePipeline(this, 'AppPipeline', {
      pipelineName: 'AppPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub(repoName, branchName, {
          authentication: SecretValue.secretsManager('secret', {
            jsonField: 'github_token',
          }),
        }),
        commands: [
          // Need to build lambda layer first
          'cd lambda-layer',
          'npm ci',
          'npm run build:layer',
          'cd ..',
          // Build the app
          'cd ecommerce-cdk-practice',
          'npm ci',
          'npm run build',
          `ENV=${env} npx cdk synth`,
          'ls -la ecommerce-cdk-practice'
        ],
        primaryOutputDirectory: 'ecommerce-cdk-practice/cdk.out',
        env: {
          ENV: env,
        },
      }),
    });

    // Add stage
    pipeline.addStage(new StagingStage(this, 'StagingStage', stage));
  }
}
