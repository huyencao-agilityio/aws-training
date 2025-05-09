import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * The AppPipeline class defines the main CDK Stack responsible for
 * creating and managing the application's CI/CD pipeline using AWS CodePipeline
 */
export class AppPipeline extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
