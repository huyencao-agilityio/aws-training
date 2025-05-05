import { IResource } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';

import { OrderProductApiConstruct } from './order-product.construct';
import { AcceptOrderApiConstruct } from './accept-order.construct';
import { RejectOrderApiConstruct } from './reject-order.construct';

/**
 * Define the construct for the resource orders
 */
export class OrderProductResourceConstruct extends Construct {
  public readonly ordersResource: IResource;
  public readonly orderIdResource: IResource;
  public readonly acceptOrderResource: IResource;
  public readonly rejectOrderResource: IResource;

  constructor(scope: Construct, id: string, props: BaseApiGatewayConstructProps) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    this.ordersResource = resource.addResource('orders');

    // Add construct to define API order products
    new OrderProductApiConstruct(this, 'OrderProductApiConstruct', {
      resource: this.ordersResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        orderModel: models!.orderModel,
        commonResponseModel: models!.commonResponseModel
      }
    });

    this.orderIdResource = this.ordersResource.addResource('{orderId}');
    this.acceptOrderResource = this.orderIdResource.addResource('accept');

    // Add construct to define API accept order
    new AcceptOrderApiConstruct(this, 'AcceptOrderApiConstruct', {
      resource: this.acceptOrderResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        commonResponseModel: models!.commonResponseModel
      }
    });

    this.rejectOrderResource = this.orderIdResource.addResource('reject');
    // Add construct to define API reject order
    new RejectOrderApiConstruct(this, 'RejectOrderApiConstruct', {
      resource: this.rejectOrderResource,
      librariesLayer: librariesLayer,
      cognitoAuthorizer: cognitoAuthorizer,
      models: {
        commonResponseModel: models!.commonResponseModel
      }
    });
  }
}
