import { defineFunction } from '@aws-amplify/backend';

export const healthCheck = defineFunction({
  name: 'healthCheck',
  entry: './handler.ts'
});
