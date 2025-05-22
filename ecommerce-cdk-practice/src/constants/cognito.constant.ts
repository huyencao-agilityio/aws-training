export const COGNITO = {
  DOMAIN_PREFIX: 'ecommerce-cdk-app',
  REDIRECT_URI: 'https://ecommerce-app.com',
  LOGOUT_URI: 'https://ecommerce-app.com/logout',
  USER_POOL_NAME: 'user-pool',
  CLIENT_NAME: 'ecommerce-client',
  EMAIL: {
    FROM: 'thanhhuyen11cntt1@gmail.com',
    SUBJECT: 'Ecommerce - Verification email address',
    BODY: 'Please click the link below to verify your email address. {##Verify Email##}'
  },
  GROUPS: {
    ADMIN: {
      NAME: 'Admin',
      DESCRIPTION: 'Admin group with elevated permissions'
    },
    USER: {
      NAME: 'User',
      DESCRIPTION: 'Standard user group'
    }
  }
} as const;

// Define const for provide mapping field
export const PROVIDER_MAP: Record<string, string> = {
  facebook: 'Facebook',
  google: 'Google'
};

// Define const for mapping field provider in Database
export const DB_PROVIDER_FIELDS: Record<string, string> = {
  Google: 'google_id',
  Facebook: 'facebook_id'
};
