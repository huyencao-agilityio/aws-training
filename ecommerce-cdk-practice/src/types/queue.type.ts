import { QueueNames } from '@constants/queue.constant';

// Define the type for the URL and ARN of a queue export
export type QueueExportName = {
  url: string;
  arn: string;
};

// Define a type for a map of queue exports
export type QueueExportMap = Record<keyof typeof QueueNames, QueueExportName>;
