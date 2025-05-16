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
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

/**
 * The AppPipeline class defines the main CDK Stack responsible for
 * creating and managing the application's CI/CD pipeline
 * using AWS CodePipeline
 */
export class AppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { stage } = props;

    const pipeline = new CodePipeline(this, 'AppPipeline', {
      pipelineName: 'AppPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub(
          'huyencao-agilityio/aws-training',
          'feature/debug-pipeline',
          {
            authentication: SecretValue.secretsManager('secret', {
              jsonField: 'github_token',
            }),
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
          `npx cdk synth`
        ],
        primaryOutputDirectory: 'ecommerce-cdk-practice/cdk.out',
        rolePolicyStatements: [
          new PolicyStatement({
            actions: [
              'route53:ListHostedZonesByName',
              'ec2:DescribeAvailabilityZones',
            ],
            resources: ['*'],
            effect: Effect.ALLOW,
          }),
        ]
      }),

    });

    // Add stage
    pipeline.addStage(new StagingStage(this, 'StagingStage', stage));
  }
}
