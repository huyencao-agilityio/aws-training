import { JsonSchemaType, IModel, Model } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct-props.interface';

/**
 * Define the construct to new all model related to user
 */
export class UserModelConstruct extends Construct {
  public readonly updateUserProfileModel: IModel;

  constructor(scope: Construct, id: string, props: RestApiModelConstructProps) {
    super(scope, id);

    // Create model to defines the fields to update a user
    this.updateUserProfileModel = new Model(this, 'UpdateUserProfileModel', {
      restApi: props.restApi,
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
  }
}
