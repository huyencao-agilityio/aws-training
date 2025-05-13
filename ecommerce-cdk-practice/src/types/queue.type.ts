import { QueueNames } from '@constants/queue.constant';

// Define the type for the URL and ARN of a queue resource
export type QueueResource = {
  url: string;
  arn: string;
};

// Define a type for a map of queue resources
export type QueueResources = Record<keyof typeof QueueNames, QueueResource>;
