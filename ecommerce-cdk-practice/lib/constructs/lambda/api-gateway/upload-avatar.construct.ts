import { Duration } from 'aws-cdk-lib';
import { Function, IFunction, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { BUCKET_NAME } from '../../../../src/constants/bucket.constant';

/**
 * Construct for creating Lambda function
 * for API upload avatar
 */
export class UploadAvatarLambdaConstruct extends Construct {
  public readonly uploadAvatarLambda: IFunction;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    // Create the Lambda function for product retrieval
    this.uploadAvatarLambda = new Function(this, 'UploadAvatar', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'upload-avatar.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/users/', {
        exclude: ['**/*', '!upload-avatar.js'],
      }),
      layers: [props.librariesLayer],
      timeout: Duration.seconds(3),
      environment: {
        BUCKET_NAME: BUCKET_NAME
      },
    });
  }
}
