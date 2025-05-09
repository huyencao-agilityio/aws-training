
import {
  BasePathMapping,
  DomainName,
  EndpointType
} from 'aws-cdk-lib/aws-apigateway';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

import { ApiDomainConstructProps } from '@interfaces/construct.interface';

/**
 * ApiDomainConstruct is responsible for configuring a custom domain
 * for an API Gateway REST API
 */
export class ApiDomainConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiDomainConstructProps) {
    super(scope, id);

    const {
      hostedZone,
      certificate,
      domainName,
      recordName,
      restApi,
      basePathApi
    } = props;

    // Create custom domain for API Gateway
    const apiDomain = new DomainName(this, 'ApiDomain', {
      domainName,
      certificate,
      endpointType: EndpointType.REGIONAL,
    });

    // Create API Mapping to map the API stages to the custom domain name
    new BasePathMapping(this, 'BasePathMapping', {
      domainName: apiDomain,
      restApi,
      basePath: basePathApi,
      stage: restApi.deploymentStage
    });

    // Add A record for API Gateway in Route 53
    new ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      recordName,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomain))
    });
  }
}
