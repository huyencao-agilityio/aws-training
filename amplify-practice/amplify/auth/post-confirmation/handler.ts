import {
  PostConfirmationTriggerEvent,
  PostConfirmationTriggerHandler
} from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { PrismaClient } from '@prisma/client';

import { UserGroup } from '../../shared/enums/user-group.enum';
import { ProviderType } from '../../shared/enums/provider-type.enum';
import {
  CognitoIdentityProvider
} from '../../shared/interfaces/cognito.interface';

const cognito = new CognitoIdentityServiceProvider();
const prisma = new PrismaClient();

export const handler: PostConfirmationTriggerHandler = async (
  event: PostConfirmationTriggerEvent
): Promise<PostConfirmationTriggerEvent> => {
  console.log('PostConfirmationTriggerHandler', JSON.stringify(event));

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
    GroupName: UserGroup.USER,
    UserPoolId: userPoolId,
    Username: userSub
  };
  const identities: CognitoIdentityProvider[] = JSON.parse(
    identitiesStr
  ) || [];

  const facebookUserId = identities.find(
    id => id.providerName === ProviderType.FACEBOOK
  )?.userId || null;
  const googleUserId = identities.find(
    id => id.providerName === ProviderType.GOOGLE
  )?.userId || null;

  try {
    await cognito.adminAddUserToGroup(params).promise();

    console.log(`Added ${email} to group User`);

    await prisma.user.upsert({
      where: { id: userSub },
      update: {
        email,
        name,
        google_id: googleUserId,
        facebook_id: facebookUserId,
      },
      create: {
        id: userSub,
        email,
        name,
        google_id: googleUserId,
        facebook_id: facebookUserId,
      },
    });

    return event;
  } catch (err) {
    console.error('Has error when saving data to DB:', err);

    throw err;
  }
};
