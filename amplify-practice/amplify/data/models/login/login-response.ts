import { a } from '@aws-amplify/backend';

export const LoginResponse = a.customType({
  ChallengeName: a.string(),
  Session: a.string()
});
