import { IModel, JsonSchemaType, Model } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct to create new model for order
 */
export class OrderModelConstruct extends Construct {
  public readonly orderProductRequestModel: IModel;

  constructor(scope: Construct, id: string, props: RestApiModelConstructProps) {
    super(scope, id);

    const { restApi } = props;

    // Create model to defines the fields to order product
    this.orderProductRequestModel = new Model(this, 'OrderProductRequestModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'OrderProductRequestModel',
      description: 'This model defines the format data for body request when user order product',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          cartItemIds: {
            type: JsonSchemaType.ARRAY,
            items: {
              type: JsonSchemaType.STRING,
              format: 'uuid'
            },
            minItems: 1
          }
        },
        required: ['cartItemIds'],
        minItems: 1
      },
    });
  }
}
