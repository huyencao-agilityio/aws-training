import { Construct } from 'constructs';

import { APP_NAME } from '@constants/app.constant';

/**
 * Build a resource name
 *
 * @param scope - The scope of the construct
 * @param resourceType - The type of the resource
 * @returns The resource name
 */
export const buildResourceName = (
  scope: Construct,
  resourceType: string
): string => {
  const stage = scope.node.tryGetContext('stage') || 'dev';

  return `${APP_NAME}-${resourceType}-${stage}`;
};
