import { defineAuth, secret } from '@aws-amplify/backend';
import 'dotenv/config';

import { UserGroup } from '../shared/enums/user-group.enum';
import { COGNITO } from '../shared/constants/cognito.constant';

import { customMessage } from './custom-message/resource';
import { preSignUp } from './pre-sign-up/resource';
import { postConfirmation } from './post-confirmation/resource';
import { defineAuthChallenge } from './define-auth-challenge/resource';
import { createAuthChallenge } from './create-auth-challenge/resource';
import {
  verifyAuthChallengeResponse
} from './verify-auth-challenge-response/resource';

const callbackUrls = [
  process.env.REACT_APP_URL || '',
  COGNITO.REDIRECT_URI
];

const logoutUrls = [
  process.env.LOGOUT_URL || '',
  COGNITO.LOGOUT_URI
];

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    // Login with email and custom verification message
    email: {
      verificationEmailStyle: 'LINK',
      verificationEmailSubject: COGNITO.EMAIL.SUBJECT,
      verificationEmailBody: (createLink) => {
        return `${COGNITO.EMAIL.BODY} ${createLink('Verify Email')}.`
      }
    },
    // Login with external providers
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: 'email',
          givenName: 'name',
          emailVerified: 'email_verified',
        },
      },
      facebook: {
        clientId: secret('FACEBOOK_CLIENT_ID'),
        clientSecret: secret('FACEBOOK_CLIENT_SECRET'),
        scopes: ['email', 'public_profile'],
        attributeMapping: {
          email: 'email',
          givenName: 'name'
        },
      },
      callbackUrls: callbackUrls,
      logoutUrls: logoutUrls,
    },
  },
  // Define the attributes that are required when a new user is created
  userAttributes: {
    email: { required: true },
    givenName: { required: true },
  },
  // Define triggers for auth
  triggers: {
    customMessage,
    preSignUp,
    postConfirmation,
    defineAuthChallenge,
    createAuthChallenge,
    verifyAuthChallengeResponse,
  },
  // Define email sender for auth
  senders: {
    email: {
      fromEmail: COGNITO.EMAIL.FROM
    },
  },
  // Define groups for authorization
  groups: [UserGroup.ADMIN, UserGroup.USER],
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
    allow.resource(preSignUp).to(['deleteUser', 'listUsers']),
  ],
});
