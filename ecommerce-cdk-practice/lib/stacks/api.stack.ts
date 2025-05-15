import { Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiStackProps } from '@interfaces/stack.interface';
import { getLibrariesLayer } from '@helpers/layer.helper';

import { RestApiConstruct } from '../constructs/api-gateway/rest-api.construct';
import { ApiDomainConstruct } from '../constructs/api-gateway/api-domain.construct';

/**
 * ApiStack is responsible for provisioning all API Gateway resources and
 * related integrations for the application.
 */
export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      userPool,
      hostedZone,
      certificate,
      domainName,
      basePathApi,
      stage
    } = props;

    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Init REST API Construct
    const restApiConstruct = new RestApiConstruct(this, 'RestApiConstruct', {
      librariesLayer,
      userPool,
      stage
    });

    const { restApi } = restApiConstruct;

    // Create new api custom domain for rest api
    new ApiDomainConstruct(this, 'ApiDomainConstruct', {
      hostedZone: hostedZone!,
      certificate: certificate!,
      domainName: domainName!,
      restApi,
      basePathApi,
    });

    // Export API Url
    new CfnOutput(this, 'ApiGatewayRestApiUrl', {
      value: restApi.url,
      exportName: 'ApiGatewayRestApiUrl',
    });

    // Export API Id
    new CfnOutput(this, 'ApiGatewayRestApiId', {
      value: restApi.restApiId,
      exportName: 'ApiGatewayRestApiId',
    });

    // Export Stage name
    new CfnOutput(this, 'ApiGatewayRestApiStage', {
      value: restApi.deploymentStage.stageName,
      exportName: 'ApiGatewayRestApiStage',
    });
  }
}
