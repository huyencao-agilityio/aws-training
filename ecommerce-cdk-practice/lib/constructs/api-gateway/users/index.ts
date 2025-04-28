import { Resource } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { RestApiResourceConstructProps } from '@interfaces/construct-props.interface';

import { UpdateUsersDetailConstruct } from './update-user.construct';
import { UserProfileConstruct } from '../user-model.construct';

/**
 * Define the construct for the resource users
 */
export class UsersResourceConstruct extends Construct {
  public readonly usersResource: Resource;
  public readonly userIdResource: Resource;

  constructor(scope: Construct, id: string, props: RestApiResourceConstructProps<UserProfileConstruct>) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, model } = props;

    this.usersResource = resource.addResource('users');
    this.userIdResource = this.usersResource.addResource('{userId}');

    // Add construct to define API update user detail
    new UpdateUsersDetailConstruct(this, 'UpdateUsersDetailConstruct', {
      resource: this.userIdResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      model: model.updateUserProfileModel
    });
  }
}
