import { IResource } from 'aws-cdk-lib/aws-apigateway';
import { IAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { getProductsMethod } from './get-products';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export const createProductsApi = (
  scope: Construct,
  apiResource: IResource,
  authorizerLambda: IAuthorizer,
  librariesLayer: ILayerVersion,
  userPool: UserPool
): IResource => {
  const products = apiResource.addResource('products');

  // Add all methods
  getProductsMethod(scope, products, authorizerLambda, librariesLayer, userPool);

  return products;
};
