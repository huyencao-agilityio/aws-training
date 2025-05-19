export const DOMAIN_NAME = 'ecommerce-app.click';
export const BASE_URL = `https://${DOMAIN_NAME}`;

export const ENVIRONMENTS = {
  staging: {
    apiGateway: {
      domainName: 'staging-api.ecommerce-app.click',
      basePathApi: 'v1',
      stage: 'v1',
    },
    cloudFront: {
      domainName: 'cdn.ecommerce-app.click',
    },
    cognito: {
      domainName: 'auth-staging.ecommerce-app.click',
    },
  },
  testing: {
    apiGateway: {
      domainName: 'api.ecommerce-app.click',
      basePathApi: 'v1',
      stage: 'v1',
    },
    cloudFront: {
      domainName: 'cdn.ecommerce-app.click',
    },
    cognito: {
      domainName: 'auth-staging.ecommerce-app.click',
    },
  },
  // Add more environments here as needed
};
