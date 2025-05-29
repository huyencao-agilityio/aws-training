import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  CreateAuthChallengeLambdaConstruct
} from '@constructs/lambda/cognito/create-auth-challenge.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestCreateAuthChallengeLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1'
      }
    });

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'TestLibrariesLayer');

    // Create auth challenge lambda construct
    new CreateAuthChallengeLambdaConstruct(
      stack,
      'TestCreateAuthChallengeLambdaConstruct',
      {
        librariesLayer,
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
      FunctionName: 'ecommerce-cognito-create-auth-challenge-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          DEFAULT_EMAIL: Match.anyValue(),
          CHALLENGE_CODE: Match.anyValue(),
        },
      },
      Layers: [
        {
          Ref: Match.stringLikeRegexp('.*LibrariesLayerArn.*')
        },
      ]
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
            Action: 'ses:SendEmail',
            Resource: {
              'Fn::Join': [
                '',
                [
                  'arn:aws:ses:us-east-1:123456789012:identity/',
                  {
                    Ref: Match.anyValue()
                  }
                ]
              ]
            }
          }),
        ]),
      },
    });
  });
});
