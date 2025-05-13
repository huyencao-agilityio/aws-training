import {
  IModel,
  JsonSchemaType,
  Model,
  IRestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct to new model for common response in API
 */
export class CommonResponseModelConstruct extends Construct {
  public readonly commonResponseModel: IModel;

  constructor(
    scope: Construct,
    id: string,
    props: RestApiModelConstructProps
  ) {
    super(scope, id);

    const { restApi } = props;

    // Create model to defines the fields for common response in API
    this.commonResponseModel = this.createCommonResponseModel(restApi);
  }

  /**
   * Create the common response model
   *
   * @param restApi - The REST API
   * @returns The common response model
   */
  createCommonResponseModel(restApi: IRestApi): IModel {
    const model = new Model(this, 'CommonResponseModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'CommonResponseModel',
      description: 'Standard response model for successful API operations',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          message: {
            type: JsonSchemaType.STRING
          }
        }
      },
    });

    return model;
  }
}
