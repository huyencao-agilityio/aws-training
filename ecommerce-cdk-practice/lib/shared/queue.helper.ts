import { Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QueueResources } from '@app-types/queue.type';
import { QueueNames } from '@constants/queue.constant';

import { buildResourceName } from './resource.helper';

/**
 * Get the queue resources
 *
 * @param scope - The scope of the stack
 * @returns The queue resources
 */
export const getQueueResources = (scope: Construct): QueueResources => {
  return Object.fromEntries(
    Object.entries(QueueNames).map(([key, baseName]) => [
      key,
      {
        url: Fn.importValue(`${buildResourceName(scope, baseName)}-url`),
        arn: Fn.importValue(`${buildResourceName(scope, baseName)}-arn`),
      },
    ])
  ) as QueueResources;
};
