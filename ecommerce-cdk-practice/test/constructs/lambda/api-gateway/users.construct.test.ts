import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  UsersLambdaConstruct
} from '@constructs/lambda/api-gateway/users.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('UsersLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'LibrariesLayer');

    // Create users lambda construct
    new UsersLambdaConstruct(
      stack,
      'UsersLambdaConstruct',
      {
        librariesLayer
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create two lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);
  });

  it('should create update user lambda function with config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-update-user-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 30,
      Environment: {
        Variables: {
          DB_HOST: Match.anyValue(),
          DB_USER: Match.anyValue(),
          DB_PASSWORD: Match.anyValue(),
          DB_NAME: Match.anyValue(),
        },
      },
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
    });
  });

  it('should create upload avatar lambda function with config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-upload-avatar-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 3,
      Environment: {
        Variables: {
          BUCKET_NAME: 'ecommerce-user-assets-dev',
        },
      },
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
    });
  });
});
