import { a } from '@aws-amplify/backend';

import { RESOLVER_PATH } from '../../shared/constants/resolver.constant';

/**
 * Define the health check schema including the API for health check
 */
export const healthCheckSchema = {
  // Define the health check API
  healthCheckApi: a
    .query()
    .returns(a.string())
    .authorization(allow => [
      allow.publicApiKey(),
    ])
    .handler(a.handler.custom({
      entry: `${RESOLVER_PATH}health-check.js`
    })),
}
