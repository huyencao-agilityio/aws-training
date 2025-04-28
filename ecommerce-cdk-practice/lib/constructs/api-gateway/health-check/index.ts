import { IResource } from 'aws-cdk-lib/aws-apigateway';
import { IAuthorizer } from 'aws-cdk-lib/aws-apigateway';

import { healthCheckMethod } from './health-check';
import { healthCheckLambdaMethod } from './health-check-lambda';

/**
 * Creates the Health Check API resource and its associated methods
 *
 * @param apiResource - The parent API resource to attach to
 * @param authorizerLambda - The Lambda authorizer for request validation
 * @param authorizerCognito - The Cognito authorizer for request validation
 */
export const createHealthCheckApi = (
  apiResource: IResource,
  authorizerLambda: IAuthorizer,
  authorizerCognito: IAuthorizer
): IResource => {
  // Create the health-check resource
  const healthCheck = apiResource.addResource('health-check');
  const healthCheckLambda = apiResource.addResource('health-check-lambda');

  // Add all methods for health status resource
  healthCheckMethod(healthCheck, authorizerCognito);
  healthCheckLambdaMethod(healthCheckLambda, authorizerLambda);

  return healthCheck;
};
