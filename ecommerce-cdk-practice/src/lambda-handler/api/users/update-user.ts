import { Handler } from 'aws-lambda';

import { PgPool } from'/opt/nodejs/index.js';

import { UserGroup } from '@enums/user-group.enum';
import { User } from '@interfaces/user.interface';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import {
  APIGatewayEventRequestUserResource
} from '@interfaces/api-gateway-event.interface';

export const handler: Handler = async (
  event: APIGatewayEventRequestUserResource<User>
): Promise<User> => {
  console.log('API Update User Profile', JSON.stringify(event));

  const {
    context: { group, sub: currentUserId },
    userId = '',
    body: data = {},
  } = event;

  const { email } = data;
  const isAdmin = group === UserGroup.ADMIN;

  if (!isAdmin && currentUserId !== userId) {
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
    // Check if user exists
    const checkUserQuery = 'SELECT id FROM public.user WHERE id = $1';
    const user = await PgPool.query(checkUserQuery, [userId]);

    if (!user.rowCount) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.NOT_FOUND,
        message: 'User not found'
      }));
    }

    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = [userId, ...Object.values(data)];

    const updateQuery = `
      UPDATE public.user
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
     // Update user to database
    const result = await PgPool.query(updateQuery, values);
    const userData: User = result.rows[0];

    return userData;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.CONFLICT,
        message: 'Email already exists'
      }));
    }

    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SEVER_ERROR,
      message: `Has error when updating user profile ${error}`
    }));
  }
};
