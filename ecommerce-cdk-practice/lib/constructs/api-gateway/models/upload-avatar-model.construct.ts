import {
  IModel,
  IRestApi,
  JsonSchemaType,
  Model
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct to new all model related to user
 */
export class UploadAvatarModelConstruct extends Construct {
  public readonly uploadAvatarModel: IModel;
  public readonly presignedS3ResponseModel: IModel;

  constructor(
    scope: Construct,
    id: string,
    props: RestApiModelConstructProps
  ) {
    super(scope, id);

    const { restApi } = props;

    // Create model to defines the fields to upload avatar
    this.uploadAvatarModel = this.createUploadAvatarModel(restApi);

    // Create model to defines the fields to upload avatar
    this.presignedS3ResponseModel = this.createPresignedS3ResponseModel(restApi);
  }

  /**
   * Create the upload avatar model
   *
   * @param restApi - The REST API
   * @returns The upload avatar model
   */
  createUploadAvatarModel(restApi: IRestApi): IModel {
    const model = new Model(this, 'UploadAvatarModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'UploadAvatarModel',
      description: 'This model defines the fields' +
        'when user upload their avatar',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          contentType: {
            type: JsonSchemaType.STRING,
            enum: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
          }
        }
      },
    });

    return model;
  }

  /**
   * Create the presigned S3 response model
   *
   * @param restApi - The REST API
   * @returns The presigned S3 response model
   */
  createPresignedS3ResponseModel(restApi: IRestApi): IModel {
    const model = new Model(this, 'PresignedS3ResponseModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'PresignedS3ResponseModel',
      description: 'This model defines the standard structure of a response' +
        'containing a presigned S3',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          url: {
            type: JsonSchemaType.STRING,
          },
          fields: {
            type: JsonSchemaType.OBJECT,
            properties: {
              'Content-Type': {
                type: JsonSchemaType.STRING
              },
              'x-amz-meta-user-id': {
                type: JsonSchemaType.STRING
              },
              'bucket': {
                type: JsonSchemaType.STRING
              },
              'X-Amz-Algorithm': {
                type: JsonSchemaType.STRING
              },
              'X-Amz-Credential': {
                type: JsonSchemaType.STRING
              },
              'X-Amz-Date': {
                type: JsonSchemaType.STRING
              },
              'X-Amz-Security-Token': {
                type: JsonSchemaType.STRING
              },
              'key': {
                type: JsonSchemaType.STRING
              },
              'Policy': {
                type: JsonSchemaType.STRING
              },
              'X-Amz-Signature': {
                type: JsonSchemaType.STRING
              },
            },
          }
        }
      },
    });

    return model;
  }
}
