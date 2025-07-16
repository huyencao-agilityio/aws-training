export type GraphQLAuthMode =
  | 'apiKey'
  | 'oidc'
  | 'userPool'
  | 'iam'
  | 'identityPool'
  | 'lambda'
  | 'none';

export const authModeMap: Record<string, GraphQLAuthMode> = {
  AMAZON_COGNITO_USER_POOLS: 'userPool',
  AWS_IAM: 'iam',
  API_KEY: 'apiKey',
  OPENID_CONNECT: 'oidc',
  AWS_LAMBDA: 'lambda',
};
