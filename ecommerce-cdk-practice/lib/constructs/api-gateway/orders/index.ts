import { Construct } from 'constructs';
import { ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import {
  CognitoUserPoolsAuthorizer,
  IResource
} from 'aws-cdk-lib/aws-apigateway';

import { BaseApiGatewayConstructProps } from '@interfaces/construct.interface';
import { ResourceConfig } from '@interfaces/resource.interface';
import { ApiGatewayModel } from '@interfaces/api-gateway-model.interface';

import { OrderProductApiConstruct } from './order-product.construct';
import { AcceptOrderApiConstruct } from './accept-order.construct';
import { RejectOrderApiConstruct } from './reject-order.construct';
import { OrderLambdaConstruct } from '../../lambda/api-gateway';

/**
 * Define the construct for the resource orders
 */
export class OrderProductResourceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: BaseApiGatewayConstructProps
  ) {
    super(scope, id);

    const { resource, librariesLayer, cognitoAuthorizer, models } = props;

    // Create the Lambda function
    const orderLambdaConstruct = this.createLambdas(librariesLayer!);

    // Create the API resources
    this.createApiResources(
      resource,
      models!,
      orderLambdaConstruct,
      cognitoAuthorizer!
    );
  }

  /**
   * Create the Lambda function for order resource and all nested in order resource
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function
   */

  createLambdas(librariesLayer: ILayerVersion): OrderLambdaConstruct {
    const lambdaFn = new OrderLambdaConstruct(
      this,
      'OrderLambdaConstruct',
      { librariesLayer }
    );

    return lambdaFn;
  }

  /**
   * Create the API resources for the order resource and all nested in order resource
   *
   * @param resource - The resource
   * @param models - The models
   * @param orderLambdaConstruct - The order Lambda construct
   * @param cognitoAuthorizer - The Cognito user pools authorizer
   */
  createApiResources(
    resource: IResource,
    models: ApiGatewayModel,
    orderLambdaConstruct: OrderLambdaConstruct,
    cognitoAuthorizer: CognitoUserPoolsAuthorizer
  ) {
    const ordersResource = resource.addResource('orders');
    const orderIdResource = ordersResource.addResource('{orderId}');
    const acceptResource = orderIdResource.addResource('accept');
    const rejectResource = orderIdResource.addResource('reject');

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
        cognitoAuthorizer,
        models: resource.models
      });
    });
  }
}
