import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';

import { OrderProductApiConstruct } from './order-product.construct';
import { AcceptOrderApiConstruct } from './accept-order.construct';
import { RejectOrderApiConstruct } from './reject-order.construct';
import { OrderLambdaConstruct } from '../../lambda/api-gateway';
import { OrderModelConstruct } from '../models/order-model.construct';

/**
 * Define the construct for the resource orders
 */
export class OrderProductResourceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    const ordersResource = resource.addResource('orders');
    const orderIdResource = ordersResource.addResource('{orderId}');
    const acceptResource = orderIdResource.addResource('accept');
    const rejectResource = orderIdResource.addResource('reject');

    // Create the Lambda function for order resource and all nested in order resource
    const orderLambdaConstruct = new OrderLambdaConstruct(
      this,
      'OrderLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Define all construct for each resource in order
    const resources: ResourceConfig[] = [
      {
        construct: OrderProductApiConstruct,
        resource: ordersResource,
        lambdaFunction: orderLambdaConstruct.orderProductLambda,
        models: {
          orderModel: models!.orderModel,
          commonResponseModel: models!.commonResponseModel
        }
      },
      {
        construct: AcceptOrderApiConstruct,
        resource: acceptResource,
        lambdaFunction: orderLambdaConstruct.acceptOrderLambda,
        models: {
          commonResponseModel: models!.commonResponseModel
        }
      },
      {
        construct: RejectOrderApiConstruct,
        resource: rejectResource,
        lambdaFunction: orderLambdaConstruct.rejectOrderLambda,
        models: {
          commonResponseModel: models!.commonResponseModel
        }
      },
    ];

    // Create new construct for each resource
    resources.forEach(resource => {
      new resource.construct(this, `${resource.construct.name}`, {
        resource: resource.resource,
        lambdaFunction: resource.lambdaFunction,
        cognitoAuthorizer: cognitoAuthorizer,
        models: resource.models
      });
    });
  }
}
