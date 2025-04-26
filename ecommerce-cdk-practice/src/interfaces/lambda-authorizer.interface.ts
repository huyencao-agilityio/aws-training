export interface LambdaAuthorizerEvent {
  authorizationToken: string;
  methodArn: string;
}

// Lambda Authorizer Response
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

// Define interface for JWK key
export interface JwkKey {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

// Define interface for JWKS response
export interface JwksResponse {
  keys: JwkKey[];
}
