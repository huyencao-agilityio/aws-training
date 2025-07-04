import { defineFunction } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';
import {
  ResourceGroupName
} from '../../shared/enums/resource-group-name.enum';

export const verifyAuthChallengeResponse = defineFunction({
  name: buildResourceName('verify-auth-challenge-response'),
  runtime: 22,
  resourceGroupName: ResourceGroupName.AUTH
});
