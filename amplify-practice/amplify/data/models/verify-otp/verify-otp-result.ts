import { a } from '@aws-amplify/backend';

export const VerifyOtpResult = a.customType({
  AccessToken: a.string(),
  ExpiresIn: a.integer(),
  IdToken: a.string(),
  RefreshToken: a.string(),
  TokenType: a.string()
});
