export const DOMAIN_NAME = 'ecommerce-app.click';

export const ENVIRONMENTS = {
  staging: {
    apiGateway: {
      domainName: 'staging-api.ecommerce-app.click',
      basePathApi: 'v1',
    },
    cloudFront: {
      domainName: 'staging.ecommerce-app.click',
    },
    cognito: {
      domainName: 'auth-staging.ecommerce-app.click',
    },
  },
  // Add more environments here as needed
};
