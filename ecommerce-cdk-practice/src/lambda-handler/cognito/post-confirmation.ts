import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { Handler, PostConfirmationTriggerEvent } from 'aws-lambda';
import 'dotenv/config';

import { PgPool } from '/opt/nodejs/index.js';

const cognito = new CognitoIdentityServiceProvider();

export interface CognitoIdentity {
  providerName: string;
  userId: string;
}

export const handler: Handler = async (
  event: PostConfirmationTriggerEvent
): Promise<PostConfirmationTriggerEvent> => {
  console.log('Post Confirmation Trigger Event:', JSON.stringify(event, null, 2));

  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const userAttributes = event.request.userAttributes;

  const userSub = userAttributes.sub || '';
  const email = userAttributes.email || '';
  const name = userAttributes.given_name || '';
  const userPoolId = event.userPoolId || '';
  const identitiesStr = userAttributes['identities'] || '[]';

  const params = {
    GroupName: 'User',
    UserPoolId: userPoolId,
    Username: userSub
  };

  const identities: CognitoIdentity[] = JSON.parse(identitiesStr) || [];
  const facebookUserId = identities.find(id => id.providerName === 'Facebook')?.userId || null;
  const googleUserId = identities.find(id => id.providerName === 'Google')?.userId || null;

  try {
    await cognito.adminAddUserToGroup(params).promise();

    console.log(`Added ${email} to group User`);

    const query = `
      INSERT INTO public.user (id, email, name, google_id, facebook_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          name = EXCLUDED.name,
          google_id = COALESCE(EXCLUDED.google_id, public.user.google_id),
          facebook_id = COALESCE(EXCLUDED.facebook_id, public.user.facebook_id);;
    `;
    const values = [userSub, email, name, googleUserId, facebookUserId];

    await PgPool.query(query, values);

    return event;
  } catch (err) {
    console.error('Has error when saving data to DB:', err);

    throw err;
  }
};
