import { a } from '@aws-amplify/backend';

export const UpdateUserRequest = {
  id: a.string(),
  email: a.email(),
  address: a.string(),
  name: a.string(),
};
