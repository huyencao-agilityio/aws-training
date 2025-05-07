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
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: UserPoolStackProps) {
    super(scope, id, props);

    // Get layer from SSM
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Init REST API Construct
    const restApiConstruct = new RestApiConstruct(this, 'RestApiConstruct', {
      librariesLayer: librariesLayer,
      userPool: props.userPool
    });

    // Output
    new CfnOutput(this, 'REST API Gateway', {
      value: restApiConstruct.restApi.url,
      description: `REST API Gateway`,
    });
  }
}
