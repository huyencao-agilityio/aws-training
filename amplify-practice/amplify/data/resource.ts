import { ClientSchema, defineData } from '@aws-amplify/backend';
import { schema } from './schema.sql';

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
