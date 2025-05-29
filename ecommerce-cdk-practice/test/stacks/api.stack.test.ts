import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

import { ApiStack } from '@stacks/api.stack';

describe('TestApiStack', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Get hosted zone from Route53
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'ecommerce-app.click',
      }
    );

    // Get certificate from existing certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestCertificate',
      'arn:aws:acm:us-east-1:123456789012:certificate/TestCertificate'
    );

    // Get user pool from existing user pool
    const userPool = UserPool.fromUserPoolId(
      stack,
      'TestFromUserPool',
      'TestUserPool'
    );

    // Create new api stack
    const apiStack = new ApiStack(app, 'TestApiStack', {
      userPool,
      hostedZone,
      certificate,
      domainName: 'api.ecommerce-app.click',
      basePathApi: 'v1',
      stage: 'dev',
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    template = Template.fromStack(apiStack);
  });

  it('should create output for API Gateway URL', () => {
    template.hasOutput('ApiGatewayRestApiUrl', {
      Value: {
        'Fn::Join': [
          '',
          [
            'https://',
            {
              Ref: Match.stringLikeRegexp('.*RestApi.*')
            },
            '.execute-api.us-east-1.',
            {
              Ref: 'AWS::URLSuffix'
            },
            '/',
            {
              Ref: Match.stringLikeRegexp('.*RestApi.*')
            },
            '/'
          ]
        ]
      },
      Export: {
        Name: 'ApiGatewayRestApiUrl'
      }
    });
  });

  it('should create output for API Gateway ID', () => {
    template.hasOutput('ApiGatewayRestApiId', {
      Export: {
        Name: 'ApiGatewayRestApiId',
      },
      Value: {
        Ref: Match.stringLikeRegexp('.*RestApi.*')
      },
    });
  });

  it('should create output for API Gateway Stage', () => {
    template.hasOutput('ApiGatewayRestApiStage',  {
      Export: {
        Name: 'ApiGatewayRestApiStage',
      },
      Value: {
        Ref: Match.stringLikeRegexp('.*RestApi.*')
      },
    });
  });
});
