import { a, ClientSchema, defineData } from '@aws-amplify/backend';

import { login } from '../functions/auth/login/resource';
import { verifyOtp } from '../functions/auth/verify-otp/resource';
import { getProducts } from '../functions/products/get-products/resource';
import { LoginRequest } from './models/login/login-request';
import { VerifyOtpRequest } from './models/verify-otp/verify-otp-request';
import { LoginResponse } from './models/login/login-response';
import { VerifyOtpResponse } from './models/verify-otp/verify-otp-response';
import { RESOLVER_PATH } from '../shared/constants/resolver.constant';
import { ProductResponse, Product } from './models/product/product-response';
import { ProductRequest } from './models/product/product-request';

export type Schema = ClientSchema<typeof schema>;

const schema = a.schema({
  LoginResponse: LoginResponse,
  VerifyOtpResponse: VerifyOtpResponse,
  ProductResponse: ProductResponse,
  Product: Product,
  // Define the health check API
  healthCheckApi: a
    .query()
    .returns(a.string())
    .authorization(allow => [
      allow.authenticated(),
      allow.publicApiKey(),
    ])
    .handler(a.handler.custom({
      entry: `${RESOLVER_PATH}health-check.js`
    })),
  // Define the login API
  login: a
    .mutation()
    .arguments(LoginRequest)
    .returns(a.ref('LoginResponse'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(login)),
  // Define the verify OTP API
  verifyOtp: a
    .mutation()
    .arguments(VerifyOtpRequest)
    .returns(a.ref('VerifyOtpResponse'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(verifyOtp)),
  // Define the get products API
  getProducts: a
    .query()
    .arguments(ProductRequest)
    .returns(a.ref('ProductResponse'))
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey(),
    ])
    .handler(a.handler.function(getProducts)),
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      description: 'API Key for the API',
      expiresInDays: 365,
    }
  },
});
