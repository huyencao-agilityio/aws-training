import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  CustomMessageLambdaConstruct
} from '@constructs/lambda/cognito/custom-message.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('CustomMessageLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'LibrariesLayer');

    // Create custom message lambda construct
    new CustomMessageLambdaConstruct(
      stack,
      'CustomMessageLambdaConstruct',
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
      FunctionName: 'ecommerce-cognito-custom-message-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
    });
  });
});
