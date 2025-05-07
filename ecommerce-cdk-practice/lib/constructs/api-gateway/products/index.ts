import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';

import { GetProductsApiConstruct } from './get-products.construct';
import { ProductsLambdaConstruct } from '../../lambda/api-gateway';

/**
 * Define the construct for the resource products
 */
export class ProductsResourceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const {
      resource,
      userPool,
      librariesLayer,
      lambdaAuthorizer,
      models
    } = props;

    const productsResource = resource.addResource('products');

    // Create the Lambda function for product retrieval
    const productsLambdaConstruct = new ProductsLambdaConstruct(
      scope, 'GetProductsLambdaConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool!
      }
    );

    // Define all construct for each resource in order
    const resources: ResourceConfig[] = [
      {
        construct: GetProductsApiConstruct,
        resource: productsResource,
        lambdaFunction: productsLambdaConstruct.getProductsLambda,
        lambdaAuthorizer: lambdaAuthorizer,
        userPool: userPool,
        models: {
          productModel: models!.productModel
        }
      }
    ];

    // Create new construct for each resource
    resources.forEach(resource => {
      new resource.construct(this, `${resource.construct.name}`, {
        resource: resource.resource,
        librariesLayer: librariesLayer,
        lambdaFunction: resource.lambdaFunction,
        userPool: resource.userPool,
        lambdaAuthorizer: lambdaAuthorizer,
        models: resource.models
      });
    });
  }
}
