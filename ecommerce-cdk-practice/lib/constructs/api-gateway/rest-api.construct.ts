import {
  CognitoUserPoolsAuthorizer,
  EndpointType,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model';

import {
  AuthorizationConstruct
} from '../lambda/api-gateway/authorization.construct';
import { createHealthCheckApi, HealthCheckResourceConstruct } from './health-check';
import { UsersResourceConstruct } from './users';
import { UserModelConstruct } from './user-model.construct';
import { UploadAvatarModelConstruct } from './upload-avatar-model.construct';
import { OrderModelConstruct } from './order-model.construct';
import { ProductModelConstruct } from './product-model.construct';
import { CommonResponseModelConstruct } from './common-response-model.construct';
import { ProductsResourceConstruct } from './products';

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

    // Create user model to using in API
    const userModelConstruct = new UserModelConstruct(this, 'UserModelConstruct', {
      restApi: this.restApi
    });
    // Create upload avatar model
    const uploadAvatarModelConstruct = new UploadAvatarModelConstruct(
      this,
      'UploadAvatarModelConstruct',
      {
        restApi: this.restApi
      }
    );
    // Create order model
    const orderModelConstruct = new OrderModelConstruct(
      this,
      'OrderModelConstruct',
      {
        restApi: this.restApi
      }
    );
    // Create product model
    const productModelConstruct = new ProductModelConstruct(
      this,
      'ProductModelConstruct',
      {
        restApi: this.restApi
      }
    );
    // Create common response
    const commonResponseModelConstruct = new CommonResponseModelConstruct(
      this,
      'CommonResponseModelConstruct',
      {
        restApi: this.restApi
      }
    );

    // Define all model in API Gateway
    const restApiModel: ApiGatewayModel = {
      updateUserModel: userModelConstruct.updateUserProfileModel,
      uploadAvatarModel: uploadAvatarModelConstruct.uploadAvatarModel,
      presignedS3Response: uploadAvatarModelConstruct.presignedS3Response,
      orderModel: orderModelConstruct.orderProductRequestModel,
      productsModel: productModelConstruct.productsResponseModel,
      commonResponseModel: commonResponseModelConstruct.commonResponseModel
    };

    // Create APIs for app
    new HealthCheckResourceConstruct(this, 'HealthCheckResourceConstruct', {
      resource: apiResource
    });

    new ProductsResourceConstruct(this, 'ProductsResourceConstruct', {
      resource: apiResource,
      userPool: userPool,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: restApiModel
    });

    new UsersResourceConstruct(this, 'UsersResourceConstruct', {
      resource: apiResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: restApiModel
    });
  }
}
