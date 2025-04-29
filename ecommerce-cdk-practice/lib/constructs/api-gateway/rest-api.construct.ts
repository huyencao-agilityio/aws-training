import {
  CognitoUserPoolsAuthorizer,
  EndpointType,
  Model,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  UserPoolLambdaConstructProps
} from '@interfaces/construct-props.interface';
import { RestAPIModel } from '@interfaces/api-model.interface';

import {
  AuthorizationConstruct
} from '../lambda/api-gateway/authorization.construct';
import { createHealthCheckApi } from './health-check';
import { createProductsApi } from './products';
import { UsersResourceConstruct } from './users';
import { UserModelConstruct } from './user-model.construct';
import { UploadAvatarModelConstruct } from './upload-avatar-model.construct';


/**
 * Define the construct to new a REST API
 */
export class RestApiConstruct extends Construct {
  public readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

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
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization'
    });

    // Create a custom lambda authorizer
    const authorizationConstruct = new AuthorizationConstruct(
      this,
      'AuthorizationConstruct',
      {
        librariesLayer: props.librariesLayer,
        userPool: props.userPool
      }
    );
    const lambdaAuthorizer = authorizationConstruct.lambdaAuthorizer;

    // Create API resources
    const apiResource = this.restApi.root.addResource('api');

    // Create user model to using in API
    const userModelConstruct = new UserModelConstruct(this, 'UserModelConstruct', {
      restApi: this.restApi
    });
    // Create model for upload avatar to using in API
    const uploadAvatarModelConstruct = new UploadAvatarModelConstruct(
      this,
      'UploadAvatarModelConstruct',
      {
        restApi: this.restApi
      }
    );

    const restApiModel: RestAPIModel = {
      updateUserModel: userModelConstruct.updateUserProfileModel,
      uploadAvatarModel: uploadAvatarModelConstruct.uploadAvatarModel,
      presignedS3Response: uploadAvatarModelConstruct.presignedS3Response
    };

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
      props.librariesLayer,
      props.userPool
    );

    new UsersResourceConstruct(this, 'UsersResourceConstruct', {
      resource: apiResource,
      librariesLayer: props.librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: restApiModel
    });

  }
}
