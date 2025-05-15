import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';

import { UpdateUsersDetailApiConstruct } from './update-user.construct';
import { UploadAvatarApiConstruct } from './upload-avatar.construct';
import { UsersLambdaConstruct } from '../../lambda/api-gateway';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';
import { IResource } from 'aws-cdk-lib/aws-apigateway';
/**
 * Define the construct for the resource users
 */
export class UsersResourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const {
      resource,
      librariesLayer,
      cognitoAuthorizer,
      models
    } = props;

    // Create the Lambda function for user resource
    const usersLambdaConstruct = this.createLambdas(librariesLayer!);
    // Create the API resources
    this.createApiResources(
      resource,
      models!,
      usersLambdaConstruct,
      cognitoAuthorizer!,
      librariesLayer!
    );
  }

  /**
   * Create the Lambda function for user resource
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function
   */
  createLambdas(librariesLayer: ILayerVersion): UsersLambdaConstruct {
    const lambdaFn = new UsersLambdaConstruct(
      this,
      'UsersLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    return lambdaFn;
  }

  /**
   * Create the API resources for the user resource
   *
   * @param resource - The resource
   * @param models - The models
   * @param usersLambdaConstruct - The users Lambda construct
   * @param cognitoAuthorizer - The Cognito user pools authorizer
   * @param librariesLayer - The libraries layer
   */
  createApiResources(
    resource: IResource,
    models: ApiGatewayModel,
    usersLambdaConstruct: UsersLambdaConstruct,
    cognitoAuthorizer: CognitoUserPoolsAuthorizer,
    librariesLayer: ILayerVersion
  ) {
    const usersResource = resource.addResource('users');
    const userIdResource = usersResource.addResource('{userId}');
    const uploadAvatar = userIdResource.addResource('avatar');

    const resources: ResourceConfig[] = [
      {
        construct: UpdateUsersDetailApiConstruct,
        resource: userIdResource,
        lambdaFunction: usersLambdaConstruct.updateUserLambda,
        cognitoAuthorizer,
        models: {
          updateUserModel: models!.updateUserModel
        }
      },
      {
        construct: UploadAvatarApiConstruct,
        resource: uploadAvatar,
        lambdaFunction: usersLambdaConstruct.uploadAvatarLambda,
        cognitoAuthorizer,
        models: {
          uploadAvatarModel: models!.uploadAvatarModel,
          presignedS3Response: models!.presignedS3Response
        }
      },
    ];

    // Create new construct for each resource
    resources.forEach(resource => {
      new resource.construct(this, `${resource.construct.name}`, {
        resource: resource.resource,
        lambdaFunction: resource.lambdaFunction,
        userPool: resource.userPool,
        librariesLayer,
        cognitoAuthorizer,
        models: resource.models
      });
    });
  }
}
