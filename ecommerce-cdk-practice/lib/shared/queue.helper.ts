import { Fn } from 'aws-cdk-lib';

import { QueueResources } from '@app-types/queue.type';
import { QueueNames } from '@constants/queue.constant';

/**
 * Get the queue resources
 *
 * @returns The queue resources
 */
export const getQueueResources = (): QueueResources => {
  return Object.fromEntries(
    Object.entries(QueueNames).map(([key, baseName]) => [
      key,
      {
        url: Fn.importValue(`${baseName}Url`),
        arn: Fn.importValue(`${baseName}Arn`),
      },
    ])
  ) as QueueResources;
};
