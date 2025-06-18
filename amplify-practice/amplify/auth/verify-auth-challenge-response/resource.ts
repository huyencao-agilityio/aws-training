import { defineFunction } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';

export const verifyAuthChallengeResponse = defineFunction({
  name: buildResourceName('verify-auth-challenge-response'),
  entry: './handler.ts',
  runtime: 22,
  resourceGroupName: 'auth'
});
