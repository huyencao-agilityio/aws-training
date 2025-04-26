import { IResource } from 'aws-cdk-lib/aws-apigateway';
import { IAuthorizer } from 'aws-cdk-lib/aws-apigateway';

import { healthCheckMethod } from './health-check';
import { healthCheckLambdaMethod } from './health-check-lambda';

export const createHealthCheckApi = (
  apiResource: IResource,
  authorizerLambda: IAuthorizer,
  authorizerCognito: IAuthorizer
): IResource => {
  const healthCheck = apiResource.addResource('health-check');
  const healthCheckLambda = apiResource.addResource('health-check-lambda');

  // Add all methods
  healthCheckMethod(healthCheck, authorizerCognito);
  healthCheckLambdaMethod(healthCheckLambda, authorizerLambda);

  return healthCheck;
};
