import { a } from '@aws-amplify/backend';

import { getProducts } from '../../functions/products/get-products/resource';
import { ProductRequest } from '../models/product/product-request';
import { Product, ProductResponse } from '../models/product/product-response';

/**
 * Define the product schema including the API for product
 */
export const productSchema = {
  ProductResponse,
  Product,
  // Define the get products API
  getProducts: a
    .query()
    .arguments(ProductRequest)
    .returns(a.ref('ProductResponse'))
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated()
    ])
    .handler(a.handler.function(getProducts)),
}
