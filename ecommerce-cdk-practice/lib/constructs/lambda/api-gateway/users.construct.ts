import {
  Function,
  Runtime,
  Code,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import {
  BaseConstructProps
} from '@interfaces/construct.interface';
import { BUCKET_NAME } from '@constants/bucket.constant';
import { getDatabaseConfig } from '@helpers/database.helper';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';

/**
 * Construct for creating Lambda function for API update user profile
 */
export class UsersLambdaConstruct extends Construct {
  public readonly updateUserLambda: Function;
  public readonly uploadAvatarLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;
    // Get the db instance
    const dbInstance = getDatabaseConfig();

    // Create the Lambda function for update user
    this.updateUserLambda = this.createUpdateUserLambdaFunction(
      librariesLayer!,
      dbInstance
    );
    // Create the Lambda function for upload avatar
    this.uploadAvatarLambda = this.createUploadAvatarLambdaFunction(
      librariesLayer!,
      dbInstance
    );
  }

  /**
   * Create the Lambda function for update user
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @returns The Lambda function for update user
   */
  createUpdateUserLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>
  ): Function {
    const lambdaFunction = new Function(this, 'UpdateUser', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'update-user.handler',
      code: Code.fromAsset(LAMBDA_PATH.USERS, {
        exclude: ['**/*', '!update-user.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(30),
      environment: {
        ...dbInstance
      },
    });

    return lambdaFunction;
  }

  /**
   * Create the Lambda function for upload avatar
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @returns The Lambda function for upload avatar
   */
  createUploadAvatarLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>
  ): Function {
    const lambdaFunction = new Function(this, 'UploadAvatar', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'upload-avatar.handler',
      code: Code.fromAsset(LAMBDA_PATH.USERS, {
        exclude: ['**/*', '!upload-avatar.js'],
      }),
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        BUCKET_NAME: BUCKET_NAME
      },
    });

    return lambdaFunction
  }
}
