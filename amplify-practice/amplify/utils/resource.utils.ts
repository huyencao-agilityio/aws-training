import { APP_NAME } from '../shared/constants/app.const';

/**
 * Build a resource name
 *
 * @param resourceType - The type of the resource
 * @returns The resource name
 */
export const buildResourceName = (
  resourceType: string
): string => {
  const env = process.env.ENVIRONMENT || '';
  const suffix = env ? `-${env}` : '';


  return `${APP_NAME}-${resourceType}-amplify${suffix}`;
};
