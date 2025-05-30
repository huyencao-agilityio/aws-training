import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import {
  PreSignUpLambdaConstruct
} from '@constructs/lambda/cognito/pre-sign-up.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestPreSignUpLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'TestLibrariesLayer');
    // Create user pool
    const userPool = new UserPool(stack, 'TestFromUserPool')

    // Create pre signup lambda construct
    new PreSignUpLambdaConstruct(
      stack,
      'TestPreSignUpLambdaConstruct',
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
      FunctionName: 'ecommerce-cognito-pre-signup-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 900,
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
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cognito-idp:ListUsers',
              'cognito-idp:AdminLinkProviderForUser',
              'cognito-idp:AdminDeleteUser'
            ],
            Resource: [{
              'Fn::GetAtt': [
                Match.stringLikeRegexp('.*TestFromUserPool.*'),
                'Arn'
              ]
            }]
          },
        ],
      },
    });
  });
});
