import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import {
  ResizeImageLambdaConstruct
} from '@constructs/lambda/cloudfront/resize-image.construct';

describe('TestResizeImageLambdaConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Create resize image lambda construct
    new ResizeImageLambdaConstruct(stack, 'TestResizeImageLambdaConstruct', {});

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
      FunctionName: 'ecommerce-cloudfront-resize-image-dev',
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Timeout: 30
    });
  });

  it('should add policy statement to CloudFront access Lambda', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Role: Match.anyValue(),
    }),

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: [
              'lambda:GetFunction',
              'lambda:EnableReplication',
              'lambda:DisableReplication',
            ],
            Resource: 'arn:aws:lambda:us-east-1:123456789012:function:ecommerce-cloudfront-resize-image-dev:*'
          }),
        ]),
      },
    });
  });

  it('should add policy statement to CloudFront access S3', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject'
            ],
            Resource: 'arn:aws:s3:::ecommerce-user-assets-dev/*'
          }),
        ]),
      },
    });
  });
});
