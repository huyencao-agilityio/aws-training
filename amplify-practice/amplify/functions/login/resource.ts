import { defineFunction } from '@aws-amplify/backend';

export const login = defineFunction({
  name: 'login',
  entry: './handler.ts',
});
