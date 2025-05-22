import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  BaseConstructProps
} from '@interfaces/construct.interface';
import { BUCKET_NAME } from '@constants/bucket.constant';
import { getDatabaseConfig } from '@shared/database.helper';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

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
    const dbInstance = getDatabaseConfig(scope);

    // Create the Lambda function for update user
    this.updateUserLambda = this.createUpdateUserLambdaFunction(
      librariesLayer!,
      dbInstance
    );
    // Create the Lambda function for upload avatar
    this.uploadAvatarLambda = this.createUploadAvatarLambdaFunction(
      librariesLayer!
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
    const lambdaFunction = new NodejsFunction(this, 'UpdateUser', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.USERS}/update-user.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      timeout: Duration.seconds(30),
      environment: {
        ...dbInstance
      },
      functionName: buildResourceName(
        this, LAMBDA_FUNCTION_NAME.API_UPDATE_USER
      )
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
    librariesLayer: ILayerVersion
  ): Function {
    const lambdaFunction = new NodejsFunction(this, 'UploadAvatar', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.USERS}/upload-avatar.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      timeout: Duration.seconds(3),
      environment: {
        BUCKET_NAME
      },
      functionName: buildResourceName(
        this, LAMBDA_FUNCTION_NAME.API_UPLOAD_AVATAR
      )
    });

    // Add policy to can upload image to S3
    lambdaFunction.addToRolePolicy(
      PolicyHelper.s3PutObject()
    );

    return lambdaFunction
  }
}
