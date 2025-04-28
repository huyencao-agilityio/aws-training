import { Construct } from 'constructs';
import { IResource, IAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { getProductsMethod } from './get-products';

/**
 * Creates the Products API resource and its associated methods
 *
 * @param scope - The CDK construct scope
 * @param apiResource - The parent API resource to attach to
 * @param authorizerLambda - The Lambda authorizer for request validation
 * @param librariesLayer - The Lambda layer containing shared libraries
 * @param userPool - The Cognito User Pool
 * @returns The created products API resource
 */
export const createProductsApi = (
  scope: Construct,
  apiResource: IResource,
  authorizerLambda: IAuthorizer,
  librariesLayer: ILayerVersion,
  userPool: UserPool
): IResource => {
  // Create the products resource
  const products = apiResource.addResource('products');

  // Configure all HTTP methods for the products resource
  // Retrieve all products
  getProductsMethod(scope, products, authorizerLambda, librariesLayer, userPool);

  return products;
};
