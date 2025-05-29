import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  SchedulerLambdaConstruct
} from '@constructs/lambda/event-bridge/scheduler.construct';
import { getLibrariesLayer } from '@shared/layer.helper';

describe('TestSchedulerLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Get libraries layer
    const librariesLayer = getLibrariesLayer(stack, 'TestLibrariesLayer');

    // Create scheduler lambda construct
    new SchedulerLambdaConstruct(
      stack,
      'TestSchedulerLambdaConstruct',
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
      FunctionName: 'ecommerce-event-bridge-weekly-report-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          DEFAULT_EMAIL_ADDRESS: Match.anyValue(),
          ADMIN_EMAIL_ADDRESS: Match.anyValue(),
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
