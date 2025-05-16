export const DOMAIN_NAME = 'ecommerce-app.click';

export const ENVIRONMENTS = {
  staging: {
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
