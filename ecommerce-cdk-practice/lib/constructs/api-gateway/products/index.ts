import { Construct } from 'constructs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { RequestAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { IResource } from 'aws-cdk-lib/aws-apigateway';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';

import { GetProductsApiConstruct } from './get-products.construct';
import { ProductsLambdaConstruct } from '../../lambda/api-gateway';

/**
 * Define the construct for the resource products
 */
export class ProductsResourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const {
      resource,
      userPool,
      librariesLayer,
      lambdaAuthorizer,
      models
    } = props;

    // Create the Lambda function
    const productsLambdaConstruct = this.createLambdas(
      librariesLayer!,
      userPool!
    );
    // Create the API resources
    this.createApiResources(
      resource,
      models!,
      productsLambdaConstruct,
      lambdaAuthorizer!,
      librariesLayer!
    );
  }

  /**
   * Create the Lambda function for product resource and all nested in product resource
   *
   * @param librariesLayer - The libraries layer
   * @param userPool - The user pool
   * @returns The Lambda function
   */
  createLambdas(
    librariesLayer: ILayerVersion,
    userPool: IUserPool
  ): ProductsLambdaConstruct {
    const lambdaFn = new ProductsLambdaConstruct(
      this,
      'ProductsLambdaConstruct',
      {
        librariesLayer,
        userPool: userPool!
      }
    );

    return lambdaFn;
  }

  /**
   * Create the API resources for the product resource and all nested in product resource
   *
   * @param resource - The resource
   * @param models - The models
   * @param productsLambdaConstruct - The products Lambda construct
   * @param lambdaAuthorizer - The lambda authorizer
   * @param userPool - The user pool
   * @param librariesLayer - The libraries layer
   */
  createApiResources(
    resource: IResource,
    models: ApiGatewayModel,
    productsLambdaConstruct: ProductsLambdaConstruct,
    lambdaAuthorizer: RequestAuthorizer,
    librariesLayer: ILayerVersion
  ) {
    const productsResource = resource.addResource('products');

    const resources: ResourceConfig[] = [
      {
        construct: GetProductsApiConstruct,
        resource: productsResource,
        lambdaFunction: productsLambdaConstruct.getProductsLambda,
        lambdaAuthorizer,
        models: {
          productModel: models!.productModel
        }
      }
    ];

    // Create new construct for each resource
    resources.forEach(resource => {
      new resource.construct(this, `${resource.construct.name}`, {
        resource: resource.resource,
        lambdaFunction: resource.lambdaFunction,
        userPool: resource.userPool,
        librariesLayer,
        lambdaAuthorizer,
        models: resource.models
      });
    });
  }
}
