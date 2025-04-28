/**
 * Defines interface for the event received by a Lambda Authorizer.
 */
export interface LambdaAuthorizerEvent {
  authorizationToken: string;
  methodArn: string;
}

/**
 * Defines interface for the response returned by a Lambda Authorizer.
 */
export interface LambdaAuthorizerResponse {
  principalId: string;
  policyDocument: {
    Version: string;
    Statement: Array<{
      Action: string;
      Effect: string;
      Resource: string;
    }>;
  };
  context: {
    [key: string]: string;
  };
}

/**
 * Defines interface for a single JWK (JSON Web Key) used for JWT verification.
 */
export interface JwkKey {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

/**
 * Defines interface for a JWKS (JSON Web Key Set) response.
 */
export interface JwksResponse {
  keys: JwkKey[];
}
