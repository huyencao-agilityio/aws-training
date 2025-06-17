import { defineFunction, defineStorage } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';

export const customMessage = defineFunction({
  name: buildResourceName('custom-message'),
  entry: './handler.ts',
  runtime: 22,
  resourceGroupName: 'auth'
});
