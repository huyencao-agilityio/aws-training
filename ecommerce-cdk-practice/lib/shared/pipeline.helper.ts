import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource
} from 'aws-cdk-lib/pipelines';

import { SecretManagerFields } from '@constants/secret-manage-field.const';
import { PipelineOptions } from '@interfaces/pipeline.interface';

import { SecretHelper } from './secret.helper';
import { PolicyHelper } from './policy.helper';

/**
 * Helper class for creating pipelines
 */
export class PipelineHelper {
  static createPipeline(options: PipelineOptions): CodePipeline {
    const { scope, pipelineName, stageName, repo, branch } = options;

    // Get github token
    const token = SecretHelper.getSecretManager(
      SecretManagerFields.GithubToken
    );

    // Create the pipeline
    return new CodePipeline(scope, 'AppPipeline', {
      pipelineName: pipelineName,
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub(
          repo,
          branch,
          {
            authentication: token
          }
        ),
        env: {
          STAGE: stageName,
        },
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
          'npm run synth:$STAGE'
        ],
        primaryOutputDirectory: 'ecommerce-cdk-practice/cdk.out',
        rolePolicyStatements: [
          PolicyHelper.pipelineAccess()
        ]
      }),
    });
  }
}
