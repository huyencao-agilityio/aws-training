import { S3Client } from '@aws-sdk/client-s3';
import {
  createPresignedPost,
  PresignedPost,
  PresignedPostOptions
} from '@aws-sdk/s3-presigned-post';
import { Handler } from 'aws-lambda';

import { HttpStatusCode } from '@enums/http-status-code.enum';
import { UserGroup } from '@enums/user-group.enum';
import { UploadAvatar } from '@interfaces/upload-image.interface';
import {
  APIGatewayEventRequestUserResource
} from '@interfaces/api-gateway-event.interface';

const s3Client = new S3Client();

/**
 * Generate path file in S3 will store image
 *
 * @param contentType - The content type of image
 * @param userId - The user id
 * @returns - The path file in S3 will store image
 */
const generateKey = (contentType: string, userId: string): string => {
  const fileExtension = contentType.split('/').pop();
  const randomChars = Array.from({ length: 10 }, () =>
    String.fromCharCode(
      Math.random() > 0.5
        ? 65 + Math.floor(Math.random() * 26)
        : 97 + Math.floor(Math.random() * 26)
    )
  ).join('');

  const timestamp = Date.now();

  return `avatars/${userId}/img-${randomChars}-${timestamp}.${fileExtension}`;
};

/**
 * Handler to generate a presigned URL for S3 image upload
 *
 * @param event - Lambda event containing
 * @returns - A PresignedPost containing the upload URL and fields
 */
export const handler: Handler = async (
  event: APIGatewayEventRequestUserResource<UploadAvatar>
): Promise<PresignedPost> => {
  console.log('API Upload Avatar', JSON.stringify(event));

  const bucketName = process.env.BUCKET_NAME || '';
  const {
    context: { group, sub: currentUserId },
    userId = '',
    body,
  } = event;
  const { contentType } = body;
  const key = generateKey(contentType, userId);

  const isAdmin = group === UserGroup.ADMIN;

  if (!isAdmin && currentUserId !== userId) {
    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.FORBIDDEN,
      message: 'Permission denied'
    }));
  }

  try {
    const params: PresignedPostOptions = {
      Bucket: bucketName,
      Key: key,
      Expires: 3600,
      Fields: {
        'Content-Type': contentType,
        'x-amz-meta-user-id': userId,
      },
      Conditions: [
        ['starts-with', '$Content-Type', 'image/'],
        ['content-length-range', 1, 5242880],
      ],
    };

    const presignedPost = await createPresignedPost(s3Client, params);

    return presignedPost;
  } catch (error: any) {
    console.error(error);

    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SEVER_ERROR,
      message: `Error get presigned url: ${error}`
    }));
  }
};
