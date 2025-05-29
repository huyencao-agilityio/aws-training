import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import {
  VerifyAuthChallengeLambdaConstruct
} from '@constructs/lambda/cognito/verify-auth-challenge.construct';

describe('TestVerifyAuthChallengeLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Create verify auth challenge lambda construct
    new VerifyAuthChallengeLambdaConstruct(
      stack,
      'TestVerifyAuthChallengeLambdaConstruct'
    );

    template = Template.fromStack(stack);
  });

  it('should create a lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create a lambda function with the correct config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-cognito-verify-auth-challenge-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x'
    });
  });
});
