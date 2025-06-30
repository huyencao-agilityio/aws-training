import { a } from '@aws-amplify/backend';

export const UserResponse = a.customType({
  name: a.string(),
  email: a.email(),
  address: a.string(),
  avatar: a.string(),
  thumbnail: a.string(),
  google_id: a.string(),
  facebook_id: a.string(),
  created_at: a.string(),
  updated_at: a.string()
});
