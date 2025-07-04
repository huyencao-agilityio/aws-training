import { defineFunction } from '@aws-amplify/backend';

import { buildResourceName } from '../../utils/resource.utils';
import {
  ResourceGroupName
} from '../../shared/enums/resource-group-name.enum';

export const customMessage = defineFunction({
  name: buildResourceName('custom-message'),
  runtime: 22,
  resourceGroupName: ResourceGroupName.AUTH
});
