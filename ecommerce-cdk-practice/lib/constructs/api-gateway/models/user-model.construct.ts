import {
  JsonSchemaType,
  IModel,
  Model,
  IRestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct to new all model related to user
 */
export class UserModelConstruct extends Construct {
  public readonly updateUserProfileModel: IModel;

  constructor(
    scope: Construct,
    id: string,
    props: RestApiModelConstructProps
  ) {
    super(scope, id);

    const { restApi } = props;

    // Create model to defines the fields to update a user
    this.updateUserProfileModel = this.createUpdateUserProfileModel(restApi);
  }

  /**
   * Create the update user profile model
   *
   * @param restApi - The REST API
   * @returns The update user profile model
   */
  createUpdateUserProfileModel(restApi: IRestApi): IModel {
    const model = new Model(this, 'UpdateUserProfileModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'UpdateUserProfileModel',
      description: 'This model defines the fields to a user',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          email: {
            type: JsonSchemaType.STRING,
            format: 'email'
          },
          name: {
            type: JsonSchemaType.STRING
          },
          address: {
            type: JsonSchemaType.STRING
          },
        }
      },
    });

    return model;
  }
}
