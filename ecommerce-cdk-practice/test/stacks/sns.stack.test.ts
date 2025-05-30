import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { SnsStack } from '@stacks/sns.stack';

describe('TestSnsStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();

    // Create new sns stack
    const snsStack = new SnsStack(app, 'TestSnsStack', {});

    template = Template.fromStack(snsStack);
  });

  it('should create an SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });
});
