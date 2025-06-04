import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { PipelineStackProps } from '@interfaces/stack.interface';
import { APP_NAME } from '@constants/app.constant';
import { PipelineHelper } from '@shared/pipeline.helper';

import { StagingStage } from '../stages/staging.stage';

/**
 * The StagingPipelineStack class defines the main CDK Stack responsible for
 * creating and managing the application's CI/CD pipeline for the staging environment
 * using AWS CodePipeline
 */
export class StagingPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { stage } = props;

    const { stageName } = stage;
    // Get github repo and branch from context
    const github = scope.node.tryGetContext('github');
    const repo = github[stageName].repositoryName;
    const branch = github[stageName].branch;

    // Create the pipeline
    const pipeline = PipelineHelper.createPipeline({
      scope: this,
      pipelineName: `${APP_NAME}-pipeline-${stageName}`,
      stageName,
      repo,
      branch
    });

    // Add stage
    pipeline.addStage(new StagingStage(this, 'StagingStage', stage));
  }
}
