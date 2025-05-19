
import Sharp from 'sharp';
import AWS from 'aws-sdk';
import {
  Handler,
  CloudFrontResponseEvent,
  CloudFrontResultResponse
} from 'aws-lambda';

import { ImageFormat } from '@app-types/image.type';
import { HttpStatusCode } from '@enums/http-status-code.enum';

const S3 = new AWS.S3();

export const handler: Handler = async (
  event: CloudFrontResponseEvent
): Promise<CloudFrontResultResponse> => {
  const record = event.Records[0];
  const response = record.cf.response as CloudFrontResultResponse;

  if (
    response.status !== `${HttpStatusCode.NOT_FOUND}` &&
    response.status !== `${HttpStatusCode.FORBIDDEN}`
  ) {
    return response;
  }

  const request = record.cf.request;
  const bucket = request.headers.host[0].value.split('.')[0]
  const path = request.uri;
  const key = path.slice(1);

  const match = key.match(/^thumbnails\/(.+?)\/(.+\.(jpe?g|png|webp))$/);
  if (!match) {
    console.log('Invalid thumbnail path format:', key);
    return response;
  }

  const folder = match[1];
  const filename = match[2];
  const originalKey = `avatars/${folder}/${filename}`;
  const thumbnailKey = key;

  console.log('Try to resize:', originalKey, '→', thumbnailKey);

  try {
    const original = await S3.getObject({ Bucket: bucket, Key: originalKey }).promise();

    const extMatch = filename.match(/\.(jpe?g|png|webp)$/i);
    const format = (extMatch ? extMatch[1].toLowerCase() : 'jpeg') as ImageFormat;
    const body = original.Body as Buffer;

    const resizedBuffer = await Sharp(body)
      .resize(200, 200)
      .toFormat(format)
      .toBuffer();

    await S3.putObject({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: resizedBuffer,
      ContentType: `image/${format}`,
      CacheControl: 'max-age=31536000',
    }).promise();

    response.status = `${HttpStatusCode.SUCCESS}`;
    response.statusDescription = 'OK';
    response.body = resizedBuffer.toString('base64');
    response.bodyEncoding = 'base64';

    response.headers = response.headers ?? {};
    response.headers['content-type'] = [{
      key: 'Content-Type',
      value: `image/${format}`
    }];
    response.headers['cache-control'] = [{
      key: 'Cache-Control',
      value: 'max-age=31536000'
    }];

    return response;
  } catch (err) {
    console.log('Error resizing image:', err);

    return response;
  }
};
