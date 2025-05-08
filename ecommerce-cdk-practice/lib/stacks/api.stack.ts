import { Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi
} from 'aws-cdk-lib/aws-apigateway';

import { UserPoolStackProps } from '@interfaces/stack.interface';
import { getLibrariesLayer } from '@utils/layer';

import { RestApiConstruct } from '../constructs/api-gateway/rest-api.construct';

/**
 * ApiStack is responsible for provisioning all API Gateway resources and
 * related integrations for the application.
 */
export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: UserPoolStackProps) {
    super(scope, id, props);

    // Get layer from SSM
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Init REST API Construct
    const restApiConstruct = new RestApiConstruct(this, 'RestApiConstruct', {
      librariesLayer: librariesLayer,
      userPool: props.userPool
    });

    // Export API Url
    new CfnOutput(this, 'ApiGatewayRestApiUrl', {
      value: restApiConstruct.restApi.url,
      exportName: 'ApiGatewayRestApiUrl',
    });

    // Export API Id
    new CfnOutput(this, 'ApiGatewayRestApiId', {
      value: restApiConstruct.restApi.restApiId,
      exportName: 'ApiGatewayRestApiId',
    });

    // Export Stage name
    new CfnOutput(this, 'ApiGatewayRestApiStage', {
      value: restApiConstruct.restApi.deploymentStage.stageName,
      exportName: 'ApiGatewayRestApiStage',
    });
  }
}
