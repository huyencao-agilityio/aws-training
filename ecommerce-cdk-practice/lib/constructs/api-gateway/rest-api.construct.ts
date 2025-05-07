import {
  CognitoUserPoolsAuthorizer,
  EndpointType,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';

import {
  AuthorizationConstruct
} from '../lambda/api-gateway';
import { HealthCheckResourceConstruct } from './health-check';
import { UsersResourceConstruct } from './users';
import { ProductsResourceConstruct } from './products';
import { OrderProductResourceConstruct } from './orders';
import { ModelRestApiConstruct } from './models';

/**
 * Define the construct to new a REST API
 */
export class RestApiConstruct extends Construct {
  public readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { userPool, librariesLayer } = props;

    // Create the API Gateway REST API
    this.restApi = new RestApi(this, 'EcommerceApi', {
      restApiName: 'Ecommerce API CDK',
      description: 'API for Ecommerce application',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      }
    });

    // Create Cognito Authorizer
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      authorizerName: 'CognitoAuthorization',
      cognitoUserPools: [userPool],
      identitySource: 'method.request.header.Authorization'
    });

    // Create a custom lambda authorizer
    const authorizationConstruct = new AuthorizationConstruct(
      this,
      'AuthorizationConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool
      }
    );
    const lambdaAuthorizer = authorizationConstruct.lambdaAuthorizer;

    // Create API resources
    const apiResource = this.restApi.root.addResource('api');

    // Create all model for app
    const {
      userModelConstruct,
      uploadAvatarModelConstruct,
      orderModelConstruct,
      productModelConstruct,
      commonResponseModelConstruct
    } = new ModelRestApiConstruct(this, 'ModelRestApiConstruct',  {
      restApi: this.restApi
    });

    // Create APIs for app
    new HealthCheckResourceConstruct(this, 'HealthCheckResourceConstruct', {
      resource: apiResource
    });

    // Create all products API
    new ProductsResourceConstruct(this, 'ProductsResourceConstruct', {
      resource: apiResource,
      userPool: userPool,
      librariesLayer: librariesLayer,
      lambdaAuthorizer: lambdaAuthorizer,
      models: {
        productModel: productModelConstruct.productsResponseModel
      }
    });

    // Create all users API
    new UsersResourceConstruct(this, 'UsersResourceConstruct', {
      resource: apiResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        updateUserModel: userModelConstruct.updateUserProfileModel,
        uploadAvatarModel: uploadAvatarModelConstruct.uploadAvatarModel,
        presignedS3Response: uploadAvatarModelConstruct.presignedS3Response,
      }
    });

    // Create all order API
    new OrderProductResourceConstruct(this, 'OrderProductResourceConstruct', {
      resource: apiResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        orderModel: orderModelConstruct.orderProductRequestModel,
        commonResponseModel: commonResponseModelConstruct.commonResponseModel
      }
    });
  }
}
