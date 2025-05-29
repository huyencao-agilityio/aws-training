
import {
  BasePathMapping,
  DomainName,
  EndpointType,
  IDomainName,
  IRestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
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
      restApi,
      basePathApi
    } = props;

    // Create custom domain for API Gateway
    const apiDomain = this.createApiDomain(certificate, domainName);

    // Create API Mapping to map the API stages to the custom domain name
    this.createDomainMapping(apiDomain, restApi, basePathApi!);
    // Create A record for the API Gateway in Route 53
    this.createARecord(hostedZone, domainName, apiDomain);
  }

  /**
   * Create the API domain for API Gateway
   *
   * @param certificate - The certificate of the domain
   * @param domainName - The domain name that will be used for the API
   * @returns The API domain
   */
  createApiDomain(
    certificate: ICertificate,
    domainName: string,
  ): IDomainName {
    const domain = new DomainName(this, 'ApiDomain', {
      domainName,
      certificate,
      endpointType: EndpointType.REGIONAL,
    });

    return domain;
  }

  /**
   * Create the domain mapping for the API Gateway
   *
   * @param apiDomain - The domain name that will be used for the API
   * @param restApi - The REST API
   * @param basePathApi - The base path of the API
   */
  createDomainMapping(
    apiDomain: IDomainName,
    restApi: IRestApi,
    basePathApi: string
  ): void {
    new BasePathMapping(this, 'BasePathMapping', {
      domainName: apiDomain,
      restApi,
      basePath: basePathApi,
      stage: restApi.deploymentStage
    });
  }

  /**
   * Create the A record for the API Gateway in Route 53
   *
   * @param hostedZone - The hosted zone
   * @param domainName - The domain name
   * @param apiDomain - The API domain
   */
  createARecord(
    hostedZone: IHostedZone,
    domainName: string,
    apiDomain: IDomainName
  ): void {
    // Get record name from domain name
    const recordName = domainName?.split('.')[0];

    // Add A record for API Gateway in Route 53
    new ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      recordName,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomain))
    });
  }
}
