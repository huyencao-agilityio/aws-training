import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import {
  PostConfirmationLambdaConstruct
} from '@constructs/lambda/cognito/post-confirmation.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('PostConfirmationLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'LibrariesLayer');
    // Create user pool
    const userPool = new UserPool(stack, 'UserPool')

    // Create post confirmation lambda construct
    new PostConfirmationLambdaConstruct(
      stack,
      'PostConfirmationLambdaConstruct',
      {
        librariesLayer,
        userPool,
      }
    );

    template = Template.fromStack(stack);
  });

  it('should create a lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  it('should have a policy for lambda function', () => {
    template.resourceCountIs('AWS::IAM::Policy', 1);
  });

  it('should create a lambda function with the correct config', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'ecommerce-cognito-post-confirmation-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
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
      ],

    });
  });

  it('should add policy statement to lambda role', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Role: Match.anyValue(),
    }),

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: 'cognito-idp:AdminAddUserToGroup',
            Resource: {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('.*UserPool*.'),
                'Arn'
              ]
            }
          }),
        ]),
      },
    });
  });
});
