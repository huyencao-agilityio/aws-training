import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import { UpdateUsersDetailApiConstruct } from './update-user.construct';
import { UploadAvatarApiConstruct } from './upload-avatar.construct';
import { UsersLambdaConstruct } from '../../lambda/api-gateway';

/**
 * Define the construct for the resource users
 */
export class UsersResourceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const {
      resource,
      librariesLayer,
      cognitoAuthorizer,
      models
    } = props;

    const usersResource = resource.addResource('users');
    const userIdResource = usersResource.addResource('{userId}');
    const uploadAvatar = userIdResource.addResource('avatar');

    // Create the Lambda function for user resource
    const usersLambdaConstruct = new UsersLambdaConstruct(
      this,
      'UsersLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Add construct to define API update user detail
    new UpdateUsersDetailApiConstruct(this, 'UpdateUsersDetailApiConstruct', {
      resource: usersResource,
      librariesLayer: librariesLayer,
      lambdaFunction: usersLambdaConstruct.updateUserLambda,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        updateUserModel: models!.updateUserModel
      }
    });

    // Add construct to define API upload avatar
    new UploadAvatarApiConstruct(this, 'UploadAvatarApiConstruct', {
      resource: uploadAvatar,
      librariesLayer: librariesLayer,
      lambdaFunction: usersLambdaConstruct.uploadAvatarLambda,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        uploadAvatarModel: models!.uploadAvatarModel,
        presignedS3Response: models!.presignedS3Response
      }
    });
  }
}
