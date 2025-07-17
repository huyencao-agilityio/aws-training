import { a } from '@aws-amplify/backend';

export const UpdateUserRequest = {
  id: a.string().required(),
  email: a.email(),
  address: a.string(),
  name: a.string(),
  avatar: a.string(),
  thumbnail: a.string(),
};

export const UploadAvatarRequest = {
  userId: a.string(),
  contentType: a.string(),
};
