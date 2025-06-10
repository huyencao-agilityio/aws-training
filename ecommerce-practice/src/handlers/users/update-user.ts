
import { Handler } from 'aws-lambda';

import { connectDB } from '../../utils/database';
import { User } from '../../entities/user';
import { HttpStatusCode } from '../../enums/http-status-code.enum';
import { UserGroup } from '../../enums/user-group.enum';
import {
  APIGatewayEventRequestUserResource
} from '../../interfaces/api-gateway-event.interface';

export const handler: Handler = async (
  event: APIGatewayEventRequestUserResource<User>
): Promise<User> => {
  console.log('API Update User Profile', JSON.stringify(event));

  const {
    context: { group, sub: currentUserId },
    userId = '',
    body: data,
  } = event;

  const { email } = data;
  const isAdmin = group === UserGroup.ADMIN;

  if (!isAdmin && currentUserId !== userId) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.FORBIDDEN,
      message: 'Permission denied.',
    }));
  }

  if (email && isAdmin) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.FORBIDDEN,
      message: 'Admin cannot update user email',
    }));
  }

  try {
    const db = await connectDB();
    const userRepo = db.getRepository(User);

    const existingUser = await userRepo.findOneBy({ id: userId });

    if (!existingUser) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.NOT_FOUND,
        message: 'User not found',
      }));
    }

    if (email) {
      const userWithEmail = await userRepo.findOneBy({ email });
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error(JSON.stringify({
          statusCode: HttpStatusCode.CONFLICT,
          message: 'Email already exists',
        }));
      }
    }

    userRepo.merge(existingUser, data);
    const savedUser = await userRepo.save(existingUser);

    return savedUser;
  } catch (error: any) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Error updating user profile: ${error.message || error}`,
    }));
  }
};
