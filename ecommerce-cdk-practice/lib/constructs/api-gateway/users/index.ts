import { Construct } from 'constructs';
import { IResource, IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';

import { UpdateUsersDetailApiConstruct } from './update-user.construct';
import { UploadAvatarApiConstruct } from './upload-avatar.construct';
import { UsersLambdaConstruct } from '../../lambda/api-gateway';

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
      restApi,
      resource,
      librariesLayer,
      cognitoAuthorizer,
      models
    } = props;

    // Create the Lambda function for user resource
    const usersLambdaConstruct = this.createLambdas(librariesLayer!);
    // Create the API resources
    this.createApiResources(
      restApi!,
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
    restApi: IRestApi,
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
          presignedS3ResponseModel: models!.presignedS3ResponseModel
        }
      },
    ];

    // Create new construct for each resource
    resources.forEach(resource => {
      new resource.construct(this, `${resource.construct.name}`, {
        restApi,
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
