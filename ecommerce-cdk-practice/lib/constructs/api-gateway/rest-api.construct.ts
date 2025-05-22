import {
  CognitoUserPoolsAuthorizer,
  EndpointType,
  IResource,
  RequestAuthorizer,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import {
  RestApiConstructProps
} from '@interfaces/construct.interface';
import { buildResourceName } from '@shared/resource.helper';

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
  public readonly apiResource: IResource;
  public readonly lambdaAuthorizer: RequestAuthorizer;
  public readonly cognitoAuthorizer: CognitoUserPoolsAuthorizer;
  public readonly models: ModelRestApiConstruct;
  constructor(scope: Construct, id: string, props: RestApiConstructProps) {
    super(scope, id);

    const { userPool, librariesLayer, stage } = props;

    // Create the API Gateway REST API
    this.restApi = this.createRestApi(stage!);
    // Create Cognito Authorizer
    this.cognitoAuthorizer = this.createCognitoAuthorizer(userPool!);
    // Create a custom lambda authorizer
    this.lambdaAuthorizer = this.createLambdaAuthorizer(librariesLayer!, userPool!);

    // Create API resources
    this.apiResource = this.restApi.root.addResource('api');

    // Create all model for app
    this.models = this.createModels();

    // Create health check API
    this.createHealthCheckApi();
    // Create all products API
    this.createProductsApi(userPool!, librariesLayer!);
    // Create all users API
    this.createUsersApi(librariesLayer!);
    // Create all order API
    this.createOrdersApi(librariesLayer!);
  }

  /**
   * Create the REST API
   *
   * @returns The REST API
   */
  createRestApi(stage: string): RestApi {
    const api = new RestApi(this, 'RestApi', {
      restApiName: buildResourceName(this, 'api'),
      description: 'API for Ecommerce application',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
      deployOptions: {
        stageName: stage || 'v1',
      },
    });

    return api;
  }

  /**
   * Create the Cognito Authorizer
   *
   * @param userPool - The user pool
   * @returns The Cognito Authorizer
   */
  createCognitoAuthorizer(userPool: UserPool): CognitoUserPoolsAuthorizer {
    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      'CognitoUserPoolsAuthorizer',
      {
        authorizerName: 'CognitoAuthorization',
        cognitoUserPools: [userPool],
        identitySource: 'method.request.header.Authorization'
      }
    );

    return authorizer;
  }

  /**
   * Create the Lambda Authorizer
   *
   * @param librariesLayer - The libraries layer
   * @param userPool - The user pool
   * @returns The Lambda Authorizer
     */
  createLambdaAuthorizer(
    librariesLayer: ILayerVersion,
    userPool: UserPool
  ): RequestAuthorizer {
    const authorization = new AuthorizationConstruct(
      this,
      'AuthorizationConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool
      }
    );
    const lambdaAuthorizer = authorization.lambdaAuthorizer;

    return lambdaAuthorizer;
  }

  /**
   * Create the models for the API
   *
   * @returns The model construct
   */
  createModels(): ModelRestApiConstruct {
    const models = new ModelRestApiConstruct(this, 'ModelRestApiConstruct',  {
      restApi: this.restApi
    });

    return models;
  }
  /**
   * Create the health check API
   *
   * @param apiResource - The API resource
   */
  createHealthCheckApi(): void {
    new HealthCheckResourceConstruct(this, 'HealthCheckResourceConstruct', {
      resource: this.apiResource
    });
  }

  /**
   * Create the products API
   *
   * @param userPool - The user pool
   * @param librariesLayer - The libraries layer
   * @param productModelConstruct - The product model construct
   */
  createProductsApi(
    userPool: UserPool,
    librariesLayer: ILayerVersion
  ): void {
    new ProductsResourceConstruct(this, 'ProductsResourceConstruct', {
      resource: this.apiResource,
      userPool: userPool,
      librariesLayer: librariesLayer,
      lambdaAuthorizer: this.lambdaAuthorizer,
      models: {
        productModel: this.models.productModelConstruct.productsResponseModel
      }
    });
  }

  /**
   * Create the users API
   *
   * @param librariesLayer - The libraries layer
   */
  createUsersApi(
    librariesLayer: ILayerVersion
  ): void {
    const {
      uploadAvatarModel,
      presignedS3Response
    } = this.models.uploadAvatarModelConstruct;

    // Create the users API
    new UsersResourceConstruct(this, 'UsersResourceConstruct', {
      resource: this.apiResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: this.cognitoAuthorizer,
      models: {
        updateUserModel: this.models.userModelConstruct.updateUserProfileModel,
        uploadAvatarModel: uploadAvatarModel,
        presignedS3Response: presignedS3Response,
      }
    });
  }

  /**
   * Create the orders API
   *
   * @param librariesLayer - The libraries layer
   */
  createOrdersApi(
    librariesLayer: ILayerVersion
  ): void {
    const { commonResponseModel } = this.models.commonResponseModelConstruct;
    const { orderProductRequestModel } = this.models.orderModelConstruct;

    new OrderProductResourceConstruct(this, 'OrderProductResourceConstruct', {
      resource: this.apiResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: this.cognitoAuthorizer,
      models: {
        orderModel: orderProductRequestModel,
        commonResponseModel: commonResponseModel
      }
    });
  }
}
