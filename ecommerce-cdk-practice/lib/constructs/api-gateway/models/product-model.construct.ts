import { IModel, JsonSchemaType, Model } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import {
  RestApiModelConstructProps
} from '@interfaces/construct.interface';

/**
 * Define the construct to new model for common response in API
 */
export class ProductModelConstruct extends Construct {
  public readonly productsResponseModel: IModel;

  constructor(scope: Construct, id: string, props: RestApiModelConstructProps) {
    super(scope, id);

    const { restApi } = props;

    // Create model to defines the fields for get all products
    this.productsResponseModel = new Model(this, 'ProductsResponseModel', {
      restApi: restApi,
      contentType: 'application/json',
      modelName: 'ProductsResponseModel',
      description: 'This model defines the standard response structure for retrieving a paginated list of products, ' +
      'including product details and pagination metadata',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          pagination: {
            type: JsonSchemaType.OBJECT,
            properties: {
              currentPage: {
                type: JsonSchemaType.NUMBER
              },
              totalPages: {
                type: JsonSchemaType.NUMBER
               },
              totalItems: {
                type: JsonSchemaType.NUMBER
              },
              itemsPerPage: {
                type: JsonSchemaType.NUMBER
              }
            }
          },
          items: {
            type: JsonSchemaType.ARRAY,
            items: {
              type: JsonSchemaType.OBJECT,
              properties: {
                id: {
                  type: JsonSchemaType.STRING
                },
                name: {
                  type: JsonSchemaType.STRING
                },
                description: {
                  type: JsonSchemaType.STRING
                },
                price: {
                  type: JsonSchemaType.NUMBER
                },
                quantity: {
                  type: JsonSchemaType.NUMBER
                },
                createdAt: {
                  type: JsonSchemaType.STRING
                },
                updatedAt: {
                  type: JsonSchemaType.STRING
                }
              }
            }
          }
        }
      },
    });
  }
}
