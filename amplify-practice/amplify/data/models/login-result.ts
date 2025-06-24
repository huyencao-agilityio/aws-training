import { a } from '@aws-amplify/backend';

export const LoginResult = {
  ChallengeName: a.string().required(),
  Session: a.string().required()
};
