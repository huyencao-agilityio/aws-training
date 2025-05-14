import { SecretValue, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
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

    const branchName = process.env.BRANCH_NAME || '';
    const repoName = process.env.REPO_NAME || '';

    console.log('TOKEN', SecretValue.secretsManager('github-token'))

    const pipeline = new CodePipeline(this, 'AppPipeline', {
      pipelineName: 'AppPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(repoName, branchName, {
          authentication: SecretValue.secretsManager('github-token'),
        }),
        commands: [
          'cd ecommerce-cdk-practice',
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ],
        primaryOutputDirectory: 'ecommerce-cdk-practice/cdk.out',
      }),
    });

    // Add stage
    pipeline.addStage(new StagingStage(this, 'StagingStage', stage));
  }
}
