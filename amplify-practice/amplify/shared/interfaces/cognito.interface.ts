/**
 * Defines interface for Cognito identity provider information.
 */
export interface CognitoIdentityProvider {
  providerName: string;
  userId: string;
}

/**
 * Defines interface to parse provider info when register with social.
 */
export interface CognitoProviderInfo {
  provider: string;
  providerSub: string;
}
