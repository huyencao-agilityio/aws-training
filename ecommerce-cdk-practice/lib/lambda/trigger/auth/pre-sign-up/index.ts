import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { UserType, AdminLinkProviderForUserRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { PreSignUpTriggerEvent } from 'aws-lambda';
import { Handler } from 'aws-cdk-lib/aws-lambda';

import { PgPool } from '/opt/nodejs/index.js';

const cognito = new CognitoIdentityServiceProvider();

const PROVIDER_MAP: Record<string, string> = {
  facebook: 'Facebook',
  google: 'Google'
};

const DB_PROVIDER_FIELDS: Record<string, string> = {
  Google: 'google_id',
  Facebook: 'facebook_id'
};

const parseProviderFromUsername = (username: string) => {
  if (!username || !username.includes('_')) return null;
  const [prefix] = username.split('_', 1);

  return PROVIDER_MAP[prefix.toLowerCase()] || null;
};

const parseUserDetails = (username: string) => {
  if (!username || !username.includes('_')) {
    return { provider: '', providerSub: '' };
  }

  const [prefix, sub] = username.split('_', 2);

  return {
    provider: PROVIDER_MAP[prefix.toLowerCase()] || '',
    providerSub: sub || ''
  };
};

const checkExistingUser = async (userPoolId: string, email: string): Promise<UserType | null> => {
  const params = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
    Limit: 1
  };
  const result = await cognito.listUsers(params).promise();
  const users = result.Users || [];

  return users.length > 0 ? users[0] : null;
};

const handleNativeSignup = async (
  event: PreSignUpTriggerEvent
): Promise<PreSignUpTriggerEvent> => {
  const { userPoolId, request: { userAttributes: { email } } } = event;

  const existingUser = await checkExistingUser(userPoolId, email);
  if (!existingUser) return event;

  const existingUsername = existingUser.Username || '';
  const existingProvider = parseProviderFromUsername(existingUsername);

  if (existingProvider === 'Google' || existingProvider === 'Facebook') {
    throw new Error('An account already exists with this email address, please sign in using Google or Facebook');
  }

  return event;
};

const handleExternalProviderSignup = async (
  event: PreSignUpTriggerEvent
): Promise<PreSignUpTriggerEvent> => {
  const { userPoolId, userName, request: { userAttributes: { email } } } = event;
  const { provider, providerSub } = parseUserDetails(userName);

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
      ProviderName: 'Cognito',
      ProviderAttributeValue: existingUsername
    },
    SourceUser: {
      ProviderName: provider || '',
      ProviderAttributeName: 'Cognito_Subject',
      ProviderAttributeValue: providerSub || ''
    }
  };
  await cognito.adminLinkProviderForUser(params).promise();
  console.log(`Linked ${provider} identity ${providerSub} to user ${existingUsername}`);

  // Update database
  const column: string = DB_PROVIDER_FIELDS[provider || ''];

  await PgPool.query(
    `UPDATE public.user SET ${column} = $2 WHERE id = $1`,
    [existingUsername, providerSub]
  );
  console.log(`Updated user ${existingUsername} with ${provider}_id ${providerSub} in database`);

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};

export const handler: Handler = async (
  event: PreSignUpTriggerEvent
): Promise<PreSignUpTriggerEvent> => {
  console.log('Pre-Signup:', JSON.stringify(event, null, 2));

  const { request: { userAttributes: { email } }, triggerSource } = event;

  if (!email) {
    console.error('Email is missing');
    throw new Error('Email is missing');
  }

  try {
    switch (triggerSource) {
      case 'PreSignUp_SignUp':
        return await handleNativeSignup(event);

      case 'PreSignUp_ExternalProvider':
        return await handleExternalProviderSignup(event);

      default:
        return event;
    }
  } catch (error) {
    console.error('Error in pre-signup trigger:', error);
    throw error;
  }
};
