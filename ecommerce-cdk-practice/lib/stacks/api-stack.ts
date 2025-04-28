import { Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi,
  EndpointType,
  CognitoUserPoolsAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { ApiStackProps } from 'src/interfaces/api-stack.interface';

import { createProductsApi } from '../constructs/api-gateway/products';
import { createHealthCheckApi } from '../constructs/api-gateway/health-check';
import { getLibrariesLayer } from '../../src/utils/layer';
import {
  AuthorizationConstruct
} from '../constructs/lambda/api-gateway/authorization.construct';

/**
 * ApiStack is responsible for provisioning all API Gateway resources and
 * related integrations for the application.
 */
export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Get layer from SSM
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Create the API Gateway REST API
    this.api = new RestApi(this, 'EcommerceApi', {
      restApiName: 'Ecommerce API CDK',
      description: 'API for Ecommerce application',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      }
    });

    // Create Cognito Authorizer
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      authorizerName: 'CognitoAuthorization',
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization'
    });

    // Create a custom lambda authorizer
    const authorizationConstruct = new AuthorizationConstruct(
      this,
      'AuthorizationConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: props.userPool
      }
    );
    const lambdaAuthorizer = authorizationConstruct.lambdaAuthorizer;

    // Create API resources
    const apiResource = this.api.root.addResource('api');
    // Create APIs
    const healthCheck = createHealthCheckApi(
      apiResource,
      lambdaAuthorizer,
      cognitoAuthorizer
    );
    const products = createProductsApi(
      this,
      apiResource,
      lambdaAuthorizer,
      librariesLayer,
      props.userPool
    );

    // Output
    new CfnOutput(this, 'API Gateway', {
      value: this.api.url,
      description: `API Gateway`,
    });
  }
}
