import { a, ClientSchema, defineData } from '@aws-amplify/backend';

import { healthCheckSchema } from './schema/health-check';
import { authSchema } from './schema/auth';
import { productSchema } from './schema/product';
import { userSchema } from './schema/user';

export type Schema = ClientSchema<typeof schema>;

const schema = a.schema({
  ...healthCheckSchema,
  ...authSchema,
  ...productSchema,
  ...userSchema
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
