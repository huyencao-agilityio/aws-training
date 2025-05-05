import { Construct } from 'constructs';
import { IResource } from 'aws-cdk-lib/aws-apigateway';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import { GetProductsApiConstruct } from './get-products';

/**
 * Define the construct for the resource products
 */
export class ProductsResourceConstruct extends Construct {
  public readonly productsResource: IResource;

  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, userPool, librariesLayer, lambdaAuthorizer, models } = props;

    this.productsResource = resource.addResource('products');

    // Add construct to define API get products
    new GetProductsApiConstruct(this, 'GetProductsApiConstruct', {
      resource: this.productsResource,
      userPool: userPool,
      librariesLayer: librariesLayer,
      lambdaAuthorizer: lambdaAuthorizer,
      models: {
        productModel: models.productModel
      }
    });
  }
}
