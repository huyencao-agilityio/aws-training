import { a } from '@aws-amplify/backend';

import { LoginRequest } from '../models/login/login-request';
import { VerifyOtpRequest } from '../models/verify-otp/verify-otp-request';
import { LoginResponse } from '../models/login/login-response';
import { VerifyOtpResponse } from '../models/verify-otp/verify-otp-response';
import { login } from '../../functions/auth/login/resource';
import { verifyOtp } from '../../functions/auth/verify-otp/resource';

/**
 * Define the auth schema including the API for authentication
 */
export const authSchema = {
  LoginResponse,
  VerifyOtpResponse,
  // Define the login API
  login: a
    .mutation()
    .arguments(LoginRequest)
    .returns(a.ref('LoginResponse'))
    .authorization((allow) => [
      allow.guest()
    ])
    .handler(a.handler.function(login)),
  // Define the verify OTP API
  verifyOtp: a
    .mutation()
    .arguments(VerifyOtpRequest)
    .returns(a.ref('VerifyOtpResponse'))
    .authorization((allow) => [
      allow.guest()
    ])
    .handler(a.handler.function(verifyOtp)),
}
