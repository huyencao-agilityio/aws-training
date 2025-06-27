import { a } from '@aws-amplify/backend';

export const LoginRequest = {
  email: a.string().required(),
  password: a.string().required(),
};
