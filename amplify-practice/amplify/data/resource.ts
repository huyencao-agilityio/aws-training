import { a, ClientSchema, defineData } from '@aws-amplify/backend';

import { healthCheckSchema } from './schema/health-check';
import { authSchema } from './schema/auth';
import { productSchema } from './schema/product';

export type Schema = ClientSchema<typeof schema>;

const schema = a.schema({
  ...healthCheckSchema,
  ...authSchema,
  ...productSchema,
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
