import {
  AppSyncIdentityCognito,
  AppSyncResolverEvent,
  Handler
} from 'aws-lambda';

import { getPrismaClient } from '/opt/nodejs/prisma-client.js';

import { HttpStatusCode } from '../../../shared/enums/http-status-code.enum';
import { User } from '../../../shared/interfaces/user.interface';
import { UserGroup } from '../../../shared/enums/user-group.enum';

/**
 * Update user profile
 * @param event - AppSyncResolverEvent<User>
 * @returns User
 */
export const handler: Handler = async (
  event: AppSyncResolverEvent<User>
): Promise<User> => {
  console.log('API Update User Profile', JSON.stringify(event));

  const { id, email } = event.arguments;

  const filteredData = Object.fromEntries(
    Object.entries(event.arguments).filter(
      ([_, v]) =>
        v !== null &&
        v !== undefined &&
        typeof v === 'string' &&
        v.trim() !== ''
    )
  ) as Record<string, string>;

  const cognitoIdentity = event.identity as AppSyncIdentityCognito;
  const currentUserId = cognitoIdentity.sub;
  const group = cognitoIdentity.groups;

  const isAdmin = group?.includes(UserGroup.ADMIN);

  if (!isAdmin && currentUserId !== id) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.FORBIDDEN,
      message: 'Permission denied.'
    }));
  }

  if (email && isAdmin) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.FORBIDDEN,
      message: 'Admin can not update user email',
    }));
  }

  try {
    const prisma = await getPrismaClient();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.NOT_FOUND,
        message: 'User not found'
      }));
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: filteredData,
    });

    return updatedUser;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.CONFLICT,
        message: 'Email already exists'
      }));
    }

    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Has error when updating user profile ${error}`
    }));
  }
};
