import { defineFunction } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';
import {
  ResourceGroupName
} from '../../shared/enums/resource-group-name.enum';

export const defineAuthChallenge = defineFunction({
  name: buildResourceName('define-auth-challenge'),
  runtime: 22,
  resourceGroupName: ResourceGroupName.AUTH,
  timeoutSeconds: 900,
});
