import { Handler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

import {
  JwksResponse,
  LambdaAuthorizerEvent,
  LambdaAuthorizerResponse
} from '@interfaces/lambda-authorizer.interface';
import {
  ROLE_GUEST,
  TOKEN_PREFIX,
  UNAUTHORIZED_ERROR
} from '@constants/auth.constant';

// Decode and verify JWT
const { decode, verify } = jwt;

// Cognito User Pool ID
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
// Cognito Region
const COGNITO_REGION = process.env.COGNITO_REGION || '';

/**
 * Verify Cognito token
 *
 * @param token - The token to verify
 * @returns The decoded token
 */
async function verifyCognitoToken(token: string): Promise<jwt.JwtPayload> {
  const cognitoIdpUrl = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

  const jwksUrl = `${cognitoIdpUrl}${COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  const response = await fetch(jwksUrl);
  const jwks: JwksResponse = await response.json();

  const decoded = decode(token, { complete: true });

  if (!decoded || !decoded.header) {
    throw new Error('Invalid token structure');
  }
  const kid = decoded.header.kid;
  const jwk = jwks.keys.find((key) => key.kid === kid);

  if (!jwk) throw new Error('Invalid token: No matching key found');

  const pem = jwkToPem(jwk as any);

  const result = verify(token, pem, {
    algorithms: ['RS256'],
    issuer: `${cognitoIdpUrl}${COGNITO_USER_POOL_ID}`,
  }) as jwt.JwtPayload;

  return result;
}

/**
 * Generate a policy document
 *
 * @param principalId - The principal ID
 * @param effect - The effect
 * @param resource - The resource
 * @param context - The context
 */
function generatePolicy(
  principalId: string,
  effect: string,
  resource: string,
  context: Record<string, string>
): LambdaAuthorizerResponse {
  console.log('generatePolicy', principalId, effect, resource, context);

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: context
  };
}

/**
 * Implement Lambda Authorizer handler to validate token
 *
 * @param event - The event
 * @returns The policy document
 */
export const handler: Handler = async (
  event: LambdaAuthorizerEvent
): Promise<LambdaAuthorizerResponse> => {
  console.log('Lambda Authorizer', event);

  const { authorizationToken: token, methodArn} = event;

  // Check if token is provided
  if (!token || token === TOKEN_PREFIX) {
    console.log('No token provided, allowing guest access');

    return generatePolicy(ROLE_GUEST, 'Allow', methodArn, { role: ROLE_GUEST });
  }

  try {
    console.log('Token provided, allowing user access');
    // Verify Cognito token
    const decoded = await verifyCognitoToken(
      token.replace(`${TOKEN_PREFIX} `, '')
    ) as jwt.JwtPayload;
    // Additional claims verification
    const currentTime = Math.floor(Date.now() / 1000);

    // Verify expiration
    if (!decoded.exp || decoded.exp < currentTime) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    // Verify token_use
    if (!decoded.token_use || !['id', 'access'].includes(decoded.token_use)) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    // Verify sub
    if (!decoded.sub) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    // Generate policy document
    return generatePolicy(decoded.sub, 'Allow', methodArn, {
      'role': 'authenticated',
      'user': JSON.stringify({
        'sub': decoded.sub,
        'groups': decoded['cognito:groups'] || [],
      }),
    });
  } catch (error) {
    console.error('Token verification failed:', error);

    throw new Error('Unauthorized');
  }
};
