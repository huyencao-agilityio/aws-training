import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { SnsTopicConstruct } from '@constructs/sns/sns-topic.construct';
import { DEFAULT_EMAIL_ADDRESS } from '@constants/email.constant';

describe('SnsTopicConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestSnsStack');
    new SnsTopicConstruct(stack, 'TestSnsTopicConstruct');

    template = Template.fromStack(stack);
  });

  it('should create an SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  it('should create a topic with correct name format', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: Match.stringLikeRegexp('^ecommerce-.*-dev$'),
    });
  });

  it('should create an email subscription', () => {
    template.resourceCountIs('AWS::SNS::Subscription', 1);
  });

  it('should subscribe the default email address', () => {
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: DEFAULT_EMAIL_ADDRESS,
    });
  });
});
