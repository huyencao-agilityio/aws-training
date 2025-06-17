import { defineFunction } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';

export const defineAuthChallenge = defineFunction({
  name: buildResourceName('define-auth-challenge'),
  entry: './handler.ts',
  runtime: 22,
  resourceGroupName: 'auth',
  timeoutSeconds: 900,
});
