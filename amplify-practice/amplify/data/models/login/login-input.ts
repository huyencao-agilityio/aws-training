import { a } from '@aws-amplify/backend';

export const LoginInput = {
  email: a.string().required(),
  password: a.string().required(),
};
