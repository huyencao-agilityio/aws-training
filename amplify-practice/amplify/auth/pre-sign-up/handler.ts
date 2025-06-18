import {
  PreSignUpTriggerEvent,
  PreSignUpTriggerHandler
} from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import {
  UserType,
  AdminLinkProviderForUserRequest
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { getPrismaClient, PrismaClient } from '/opt/nodejs/prisma-client.js';

import { PreSignUpTrigger } from '../../shared/enums/pre-signup-trigger.enum';
import { ProviderType } from '../../shared/enums/provider-type.enum';
import {
  DB_PROVIDER_FIELDS,
  PROVIDER_MAP
} from '../../shared/constants/cognito.constant';
import {
  CognitoProviderInfo
} from '../../shared/interfaces/cognito.interface';

const cognito = new CognitoIdentityServiceProvider();

/**
 * Parses the identity provider from a Cognito username.
 *
 * @param username - The Cognito username.
 * @returns The provider name from PROVIDER_MAP, or null if not found.
 */
const parseProviderFromUsername = (username: string): string | null => {
  if (!username || !username.includes('_')) return null;
  const [prefix] = username.split('_', 1);

  return PROVIDER_MAP[prefix.toLowerCase()] || null;
};

/**
 * Extracts provider and provider sub (user ID) from a Cognito username.
 *
 * @param username - The Cognito username.
 * @returns An object with 'provider' and 'providerSub' properties.
 */
const parseProviderInfo = (username: string): CognitoProviderInfo => {
  if (!username || !username.includes('_')) {
    return { provider: '', providerSub: '' };
  }

  const [prefix, sub] = username.split('_', 2);

  return {
    provider: PROVIDER_MAP[prefix.toLowerCase()] || '',
    providerSub: sub || ''
  };
};

/**
 * Checks if a user with the given email already exists in the Cognito User Pool.
 *
 * @param userPoolId - The ID of the Cognito User Pool.
 * @param email - The email address to search for.
 * @returns The existing user (UserType) if found, otherwise null.
 */
const checkExistingUser = async (
  userPoolId: string,
  email: string
): Promise<UserType | null> => {
  const params = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
    Limit: 1
  };
  const result = await cognito.listUsers(params).promise();
  const users = result.Users || [];

  return users.length > 0 ? users[0] : null;
};

/**
 * Handles the pre sign-up logic for native (non-social) sign-ups.
 *
 * @param event - The PreSignUpTriggerEvent from Cognito.
 * @returns The updated event after processing.
 */
const handleNativeSignup = async (
  event: PreSignUpTriggerEvent
): Promise<PreSignUpTriggerEvent> => {
  const { userPoolId, request: { userAttributes: { email } } } = event;

  const existingUser = await checkExistingUser(userPoolId, email);
  if (!existingUser) return event;

  const existingUsername = existingUser.Username || '';
  const existingProvider = parseProviderFromUsername(existingUsername);

  if (existingProvider === ProviderType.GOOGLE ||
    existingProvider === ProviderType.FACEBOOK
  ) {
    throw new Error(
      'An account already exists, please sign in using Google or Facebook.'
    );
  }

  return event;
};

/**
 * Handles pre sign-up logic for users signing up with external identity providers
 * (such as Facebook or Google) in Cognito.
 *
 * @param event - The PreSignUpTriggerEvent from Cognito, containing user and request details
 * @returns The updated event after processing external provider sign-up logic
 */
const handleExternalProviderSignup = async (
  event: PreSignUpTriggerEvent,
  prisma: PrismaClient
): Promise<PreSignUpTriggerEvent> => {
  const {
    userPoolId,
    userName,
    request: { userAttributes: { email } }
  } = event;
  const { provider, providerSub } = parseProviderInfo(userName);

  const existingUser = await checkExistingUser(userPoolId, email);
  if (!existingUser) return event;

  const existingUsername = existingUser.Username;
  if (existingUsername && (
    existingUsername.startsWith('facebook_') ||
    existingUsername.startsWith('google_')
  )) {
    return event;
  }

  // Delete existing external identity if exists
  const externalUserCheck = await cognito.listUsers({
    UserPoolId: userPoolId,
    Filter: `username = "${userName}"`
  }).promise();

  const users = externalUserCheck.Users || [];

  if (users.length > 0) {
    await cognito.adminDeleteUser({
      UserPoolId: userPoolId,
      Username: userName
    }).promise();
    console.log(`Deleted ${provider} identity: ${userName}`);
  }

  // Link provider to native user
  const params: AdminLinkProviderForUserRequest = {
    UserPoolId: userPoolId,
    DestinationUser: {
      ProviderName: ProviderType.COGNITO,
      ProviderAttributeValue: existingUsername
    },
    SourceUser: {
      ProviderName: provider || '',
      ProviderAttributeName: 'Cognito_Subject',
      ProviderAttributeValue: providerSub || ''
    }
  };
  await cognito.adminLinkProviderForUser(params).promise();
  console.log(`Linked ${providerSub} to user ${existingUsername}`);

  // Update database
  const column: string = DB_PROVIDER_FIELDS[provider || ''];

  await prisma.user.update({
    where: {
      id: existingUsername,
    },
    data: {
      [column]: providerSub,
    },
  });
  console.log(`Updated user ${existingUsername} in database`);

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};

export const handler: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent
): Promise<PreSignUpTriggerEvent> => {
  console.log('PreSignUpTriggerHandler', JSON.stringify(event));

  const prisma = await getPrismaClient();

  const { request: { userAttributes: { email } }, triggerSource } = event;

  if (!email) {
    console.error('Email is missing');
    throw new Error('Email is missing');
  }

  try {
    switch (triggerSource) {
      case PreSignUpTrigger.SIGN_UP:
        return await handleNativeSignup(event);

      case PreSignUpTrigger.EXTERNAL_PROVIDER:
        return await handleExternalProviderSignup(event, prisma);

      default:
        return event;
    }
  } catch (error) {
    console.error('Error in pre-signup trigger:', error);
    throw error;
  }
};
