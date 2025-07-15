import { defineStorage } from '@aws-amplify/backend';

import { buildResourceName } from '../utils/resource.utils';
import { BUCKET_NAME } from '../shared/constants/bucket.constant';
import { UserGroup } from '../shared/enums/user-group.enum';

export const storage = defineStorage({
  name: buildResourceName(BUCKET_NAME),
  access: (allow) => ({
    'avatars/*': [
      allow.guest.to(['read']),
      allow.groups([
        UserGroup.ADMIN,
        UserGroup.USER]
      ).to(['read', 'write'])
    ],
    'thumbnails/*': [
      allow.guest.to(['read']),
      allow.groups([
        UserGroup.ADMIN, UserGroup.USER
      ]).to(['read', 'write'])
    ],
  }),
});
