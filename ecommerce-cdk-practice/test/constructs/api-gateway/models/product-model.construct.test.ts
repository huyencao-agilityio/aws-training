import { App, Stack } from 'aws-cdk-lib';
import { MockIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Template } from 'aws-cdk-lib/assertions';

import {
  ProductModelConstruct
} from '@constructs/api-gateway/models/product-model.construct';

describe('ProductModelConstruct', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');
    const restApi = new RestApi(stack, 'RestApi', {
      restApiName: 'RestApi',
    });

    // Add this fake method to pass validation
    const resource = restApi.root.addResource('test');
    resource.addMethod('GET', new MockIntegration());

    new ProductModelConstruct(stack, 'ProductModelConstruct', {
      restApi,
    });

    template = Template.fromStack(stack);
  });

  it('should create one model', () => {
    template.resourceCountIs('AWS::ApiGateway::Model', 1);
  });

  it('should create a ProductsResponseModel with correct schema', () => {
    template.hasResourceProperties('AWS::ApiGateway::Model', {
      Name: 'ProductsResponseModel',
      ContentType: 'application/json',
      Description: 'This model defines the standard response structure' +
        'for retrieving a paginated list of products, ' +
        'including product details and pagination metadata',
      Schema: {
        type: 'object',
        properties: {
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'number' },
              totalPages: { type: 'number' },
              totalItems: { type: 'number' },
              itemsPerPage: { type: 'number' }
            }
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        }
      }
    });
  });
});
