import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from 'aws-cdk-lib/pipelines';

import { PipelineStackProps } from '@interfaces/stack.interface';
import { ParameterKeys } from '@constants/parameter-keys.constant';
import { SecretHelper } from '@shared/secret.helper';
import { PolicyHelper } from '@shared/policy.helper';

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

    // Get github repo and branch from SSM Parameter Store
    const githubRepo = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.GithubRepo
    );
    const githubBranch = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.GithubBranch
    );
    // Get github token
    const githubToken = SecretHelper.getSecretValue(
      ParameterKeys.GithubToken
    );

    // Create the pipeline
    const pipeline = new CodePipeline(this, 'AppPipeline', {
      pipelineName: 'AppPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub(
          githubRepo,
          githubBranch,
          {
            authentication: githubToken
          }
        ),
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
          'npx cdk synth'
        ],
        primaryOutputDirectory: 'ecommerce-cdk-practice/cdk.out',
        rolePolicyStatements: [
          PolicyHelper.pipelineAccess()
        ]
      }),

    });

    // Add stage
    pipeline.addStage(new StagingStage(this, 'StagingStage', stage));
  }
}
