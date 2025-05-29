import { App, Fn, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

import {
  ApiDomainConstruct
} from '@constructs/api-gateway/api-domain.construct';

describe('TestApiDomainConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');

    // Mock hosted zone from existing hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      stack,
      'TestHostedZone',
      {
        hostedZoneId: 'Z0344904LOXNYZARXRJA',
        zoneName: 'example.com',
      }
    );

    // Mock certificate from existing certificate
    const certificate = Certificate.fromCertificateArn(
      stack,
      'TestFromCertificate',
      Fn.importValue('TestCertificate')
    );

    // Create rest api
    const restApi = new RestApi(stack, 'TestRestApi');

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    new ApiDomainConstruct(stack, 'TestApiDomainConstruct', {
      hostedZone,
      certificate,
      domainName: 'api.example.com',
      restApi,
      basePathApi: 'v1'
    });

    template = Template.fromStack(stack);
  });

  it('should create one record', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 1);
  });

  it('should create a API domain', () => {
    template.resourceCountIs('AWS::ApiGateway::DomainName', 1);
  });

  it('should create a domain mapping', () => {
    template.resourceCountIs('AWS::ApiGateway::BasePathMapping', 1);
  });

  it('should create a API domain with domain name in API Gateway', () => {
    template.hasResourceProperties('AWS::ApiGateway::DomainName', {
      DomainName: 'api.example.com',
      EndpointConfiguration: {
        Types: [
          'REGIONAL'
        ]
      },
      RegionalCertificateArn: {
        'Fn::ImportValue': Match.stringLikeRegexp('.*TestCertificate.*')
      }
    });
  });

  it('should create domain mapping in API Gateway', () => {
    template.hasResourceProperties('AWS::ApiGateway::BasePathMapping', {
      BasePath: 'v1',
      DomainName: {
        Ref: Match.stringLikeRegexp('.*TestApiDomainConstruct.*')
      },
      RestApiId: {
        Ref: Match.stringLikeRegexp('.*TestRestApi.*')
      },
      Stage: {
        Ref: Match.stringLikeRegexp('.*TestRestApi.*')
      },
    });
  });

  it('should create A records with correct configuration', () => {
    // Check A Record
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'A',
      Name: 'api.example.com.',
      HostedZoneId: 'Z0344904LOXNYZARXRJA',
      AliasTarget: {
        DNSName: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('.*TestApiDomainConstruct.*'),
            'RegionalDomainName'
          ],
        },
        HostedZoneId: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('.*TestApiDomainConstruct.*'),
            'RegionalHostedZoneId'
          ],
        }
      }
    });
  });


});
