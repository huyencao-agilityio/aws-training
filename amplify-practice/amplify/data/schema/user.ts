import { a } from '@aws-amplify/backend';

import { updateUserProfile } from '../../functions/users/update-user/resource';
import { uploadAvatar } from '../../functions/users/upload-avatar/resource';
import {
  UploadAvatarResponse,
  UserResponse
} from '../models/user/user-response';
import {
  UpdateUserRequest,
  UploadAvatarRequest
} from '../models/user/user-request';
import { UserGroup } from '../../shared/enums/user-group.enum';

/**
 * Define the user schema including the API for user
 */
export const userSchema = {
  UserResponse,
  UploadAvatarResponse,
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
  // Define the upload avatar API
  uploadAvatar: a
    .mutation()
    .arguments(UploadAvatarRequest)
    .returns(a.ref('UploadAvatarResponse'))
    .authorization((allow) => [
      allow.authenticated()
    ])
    .handler(a.handler.function(uploadAvatar)),
}
