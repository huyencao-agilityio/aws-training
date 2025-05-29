import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  DefineAuthChallengeLambdaConstruct
} from '@constructs/lambda/cognito/define-auth-challenge.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestDefineAuthChallengeLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'TestLibrariesLayer');

    // Create define challenge lambda construct
    new DefineAuthChallengeLambdaConstruct(
      stack,
      'TestDefineAuthChallengeLambdaConstruct',
      {
        librariesLayer,
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create a lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create a lambda function with the correct config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-cognito-define-auth-challenge-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 900,
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
    });
  });
});
