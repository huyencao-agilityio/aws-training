import { Resource } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { RestApiResourceConstructProps } from '@interfaces/construct-props.interface';

import { UpdateUsersDetailConstruct } from './update-user.construct';
import { UploadAvatarConstruct } from './upload-avatar.construct';

/**
 * Define the construct for the resource users
 */
export class UsersResourceConstruct extends Construct {
  public readonly usersResource: Resource;
  public readonly userIdResource: Resource;
  public readonly uploadAvatarResource: Resource;

  constructor(scope: Construct, id: string, props: RestApiResourceConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    this.usersResource = resource.addResource('users');

    this.userIdResource = this.usersResource.addResource('{userId}');
    // Add construct to define API update user detail
    new UpdateUsersDetailConstruct(this, 'UpdateUsersDetailConstruct', {
      resource: this.userIdResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      model: models.updateUserModel
    });

    this.uploadAvatarResource = this.userIdResource.addResource('avatar');
    // Add construct to define API upload avatar
    new UploadAvatarConstruct(this, 'UploadAvatarConstruct', {
      resource: this.uploadAvatarResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        uploadAvatarModel: models.uploadAvatarModel,
        presignedS3Response: models.presignedS3Response
      }
    });
  }
}
