import { SQS } from 'aws-sdk';
import { Handler } from 'aws-lambda';

import { PgPool } from '/opt/nodejs/index.js';

import {
  APIGatewayEventRequestOrderDetailResource
} from '@interfaces/api-gateway-event.interface';
import { ApiResponseCommon } from '@interfaces/common-response.interface';
import { HttpStatusCode } from '@enums/http-status-code.enum';
import { UserGroup } from '@enums/user-group.enum';
import { OrderStatus } from '@enums/order-status.enum';

const sqs = new SQS();

export const handler: Handler = async (
  event: APIGatewayEventRequestOrderDetailResource
): Promise<ApiResponseCommon> => {
  console.log('API Accept Order', JSON.stringify(event));

  try {
    const queueUrl = process.env.ACCEPT_QUEUE_URL || '';
    const group = event.context.group;
    const orderId = event.orderId || '';

    const isAdmin = group === UserGroup.ADMIN;

    if (!isAdmin) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.FORBIDDEN,
        message: 'Permission denied.'
      }));
    }

    // Get order by id
    const orderQuery = `
      SELECT id, status, owner_id FROM public.order WHERE id = $1
    `;
    const orderResult = await PgPool.query(orderQuery, [orderId]);

    // Show error if the order is not found
    if (orderResult.rows.length === 0) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.NOT_FOUND,
        message: 'Order not found'
      }));
    }

    const order = orderResult.rows[0];

    console.log(`Order ${JSON.stringify(order)}`);

    // Show error if the order is rejected, accepted or completed
    if (order.status !== OrderStatus.PENDING) {
      throw new Error(JSON.stringify({
        statusCode: HttpStatusCode.BAD_REQUEST,
        message: 'Can not accept an order that have have rejected, accepted or completed'
      }));
    }

    // Update order status to accepted
    const updateQuery = `
      UPDATE public.order
      SET status = $1
      WHERE id = $2
      RETURNING id, status
    `;
    await PgPool.query(updateQuery, [OrderStatus.ACCEPTED, orderId]);

    // Prepare message for SQS
    const sqsParams = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        orderId: orderId,
        userId: order.owner_id,
        message: 'Your order has been accepted.'
      }),
    };

    // Send message to SQS
    await sqs.sendMessage(sqsParams).promise();

    console.log(`Message sent to SQS for order ${orderId}`);

    return {
      statusCode: HttpStatusCode.SUCCESS,
      message: 'Order accepted successfully'
    };
  } catch (error: any) {
    console.error('Error accepting order:', error);

    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Internal server error: ${error.message}`
    }));
  }
};
