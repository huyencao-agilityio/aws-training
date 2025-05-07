import {
  Function,
  Runtime,
  Code
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import {
  BaseConstructProps
} from '@interfaces/construct.interface';
import { BUCKET_NAME } from '@constants/bucket.constant';

/**
 * Construct for creating Lambda function for API update user profile
 */
export class UsersLambdaConstruct extends Construct {
  public readonly updateUserLambda: Function;
  public readonly uploadAvatarLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for product retrieval
    this.updateUserLambda = new Function(this, 'UpdateUser', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'update-user.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/users/', {
        exclude: ['**/*', '!update-user.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(30),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword
      },
    });

    // Create the Lambda function for upload avatar
    this.uploadAvatarLambda = new Function(this, 'UploadAvatar', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'upload-avatar.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/users/', {
        exclude: ['**/*', '!upload-avatar.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        BUCKET_NAME: BUCKET_NAME
      },
    });
  }
}
