import { a, ClientSchema, defineData } from '@aws-amplify/backend';

import { login } from '../functions/login/resource';
import { LoginInput } from './models/login-input';
import { LoginResult } from './models/login-result';

export type Schema = ClientSchema<typeof schema>;

const schema = a.schema({
  login: a
    .query()
    .arguments(LoginInput)
    .returns(LoginResult)
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(login)),
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
