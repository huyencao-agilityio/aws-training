export const DOMAIN_NAME = 'ecommerce-app.click';

export const ENVIRONMENTS = {
  staging: {
    apiGateway: {
      domainName: 'staging-api.ecommerce-app.click',
      recordName: 'staging-api',
      basePathApi: 'v1',
    },
    cloudFront: {
      domainName: 'staging.ecommerce-app.click',
      recordName: 'staging',
    },
    cognito: {
      domainName: 'auth-staging.ecommerce-app.click',
      recordName: 'auth-staging',
    },
  },
  // Add more environments here as needed
};
