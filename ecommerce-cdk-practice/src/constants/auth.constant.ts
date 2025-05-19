// Lambda authorizer context
export const lambdaAuthorizerContext = `
  "requestContext": {
    "authorizer": {
      "role": "$util.escapeJavaScript($context.authorizer.role)",
      "principalId": "$util.escapeJavaScript($context.authorizer.principalId)",
      "user": "$util.escapeJavaScript($context.authorizer.user)"
    }
  }
`;

// Cognito authorizer context
export const cognitoAuthorizerContext = `
  "context": {
    "sub": "$context.authorizer.claims.sub",
    "email": "$context.authorizer.claims.email",
    "group": "$context.authorizer.claims['cognito:groups']"
  }
`;

export const COGNITO_AUTHORIZATION_SCOPES = 'aws.cognito.signin.user.admin';
export const TOKEN_PREFIX = 'Bearer ';
export const UNAUTHORIZED_ERROR = 'Unauthorized';
export const ROLE_GUEST = 'guest';
export const ROLE_AUTHENTICATED = 'authenticated';
