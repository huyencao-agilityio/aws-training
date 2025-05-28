import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import {
  ProductsLambdaConstruct
} from '@constructs/lambda/api-gateway/products.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('ProductsLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'LibrariesLayer');
    // Get user pool
    const userPool = new UserPool(stack, 'UserPool');

    // Create products lambda construct
    new ProductsLambdaConstruct(
      stack,
      'ProductsLambdaConstruct',
      {
        librariesLayer,
        userPool
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create a lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should create a lambda function with the correct config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-api-get-products-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 30,
      Environment: {
        Variables: {
          COGNITO_USER_POOL_ID: Match.anyValue(),
          COGNITO_REGION: Match.anyValue(),
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
});
