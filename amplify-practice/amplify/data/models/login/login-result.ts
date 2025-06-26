import { a } from '@aws-amplify/backend';

export const LoginResult = a.customType({
  ChallengeName: a.string(),
  Session: a.string()
});
