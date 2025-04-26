import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiStack } from '../../stacks/api-stack';
import { AuthStack } from '../../stacks/auth-stack';

export class AppStage extends Stage {
  public readonly apiStack: ApiStack;
  public readonly authStack: AuthStack;

  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    this.authStack = new AuthStack(this, 'AuthStack', {
      stackName: 'staging-auth',
    });

    this.apiStack = new ApiStack(this, 'ApiStack', {
      stackName: 'staging-api',
      userPool: this.authStack.userPoolConstruct.userPool
    });

    // Explicit dependency
    this.apiStack.addDependency(this.authStack);
  }
}
