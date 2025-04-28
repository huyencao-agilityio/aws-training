/**
 * Defines interface for Cognito identity information.
 */
export interface CognitoIdentity {
  providerName: string;
  userId: string;
}

/**
 * Defines interface to parse provider info when register with social.
 */
export interface ParseProviderInfo {
  provider: string;
  providerSub: string;
}
