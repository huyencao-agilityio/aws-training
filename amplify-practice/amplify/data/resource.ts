import { a, ClientSchema, defineData } from '@aws-amplify/backend';

import { login } from '../functions/login/resource';
import { verifyOtp } from '../functions/verify-otp/resource';
import { healthCheck } from '../functions/health-check/resource';
import { LoginInput } from './models/login/login-input';
import { VerifyOtpResult } from './models/verify-otp/verify-otp-result';
import { LoginResult } from './models/login/login-result';
import { VerifyOtpInput } from './models/verify-otp/verify-otp-input';

export type Schema = ClientSchema<typeof schema>;

const schema = a.schema({
  LoginResult: LoginResult,
  VerifyOtpResult: VerifyOtpResult,
  // Define the health check API
  healthCheck: a
    .query()
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(healthCheck)),
  // Define the login API
  login: a
    .mutation()
    .arguments(LoginInput)
    .returns(a.ref('LoginResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(login)),
  // Define the verify OTP API
  verifyOtp: a
    .mutation()
    .arguments(VerifyOtpInput)
    .returns(a.ref('VerifyOtpResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(verifyOtp)),
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      description: 'API Key for the API',
      expiresInDays: 365,
    },
  },
});
