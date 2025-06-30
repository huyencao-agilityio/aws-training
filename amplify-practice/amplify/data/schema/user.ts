import { a } from '@aws-amplify/backend';

import { updateUserProfile } from '../../functions/users/update-user/resource';
import { UserResponse } from '../models/user/user-response';
import { UpdateUserRequest } from '../models/user/user-request';
import { UserGroup } from '../../shared/enums/user-group.enum';

/**
 * Define the user schema including the API for user
 */
export const userSchema = {
  UserResponse,
  // Define the update user API
  updateUser: a
    .mutation()
    .arguments(UpdateUserRequest)
    .returns(a.ref('UserResponse'))
    .authorization((allow) => [
      allow.authenticated(),
      allow.groups([UserGroup.ADMIN])
    ])
    .handler(a.handler.function(updateUserProfile)),
}
