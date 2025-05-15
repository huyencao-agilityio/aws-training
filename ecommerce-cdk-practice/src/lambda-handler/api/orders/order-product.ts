import * as AWS from 'aws-sdk';
import { Handler } from 'aws-lambda';
import { PoolClient } from 'pg';

import { PgPool } from '/opt/nodejs/index.js';

import { HttpStatusCode } from '@enums/http-status-code.enum';
import {
  APIGatewayEventRequestOrderResource
} from '@interfaces/api-gateway-event.interface';
import { OrderProduct } from '@interfaces/order.interface';
import { CartItemAndProduct } from '@interfaces/cart.interface';
import { ApiResponseCommon } from '@interfaces/common-response.interface';

const sqs = new AWS.SQS({});

/**
 * Get cart detail by id
 *
 * @param client - The pool client
 * @param userId - The owner of cart
 * @returns - Return the card id
 */
async function getByCartId(client: PoolClient, userId: string): Promise<string> {
  const result = await client.query('SELECT id FROM public.cart WHERE owner_id = $1', [userId]);

  if (!result.rowCount) {
    throw new Error('Cart not found for this user');
  }

  return result.rows[0].id;
}

/**
 * Get cart item detail and product info
 * @param client - The Pool client
 * @param cartItemIds - The list cart item
 * @param cartId - The cart id
 * @returns - Return the cart item info and product info
 */
async function getCartItems(
  client: PoolClient,
  cartItemIds: string[],
  cartId: string
): Promise<CartItemAndProduct[]> {
  const result = await client.query(
    `
    SELECT ci.id, ci.product_id, ci.quantity, p.price, p.name, p.quantity AS product_quantity
    FROM public.cart_item ci
    JOIN public.product p ON ci.product_id = p.id
    WHERE ci.id = ANY($1::uuid[]) AND ci.cart_id = $2
  `,
    [cartItemIds, cartId]
  );

  return result.rows;
}

/**
 * Send order message to SQS
 *
 * @param orderId - The order id
 * @param email - The email of current user
 * @param totalAmount - The total mount
 * @param totalQuantity - The total quantity
 * @param items - The cart items
 */
async function sendOrderMessage(
  orderId: string,
  email: string,
  totalAmount: number,
  totalQuantity: number,
  items: CartItemAndProduct[]
) {
  const queueUrl = process.env.ORDER_QUEUE_URL || '';

  return await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        orderId,
        email,
        totalAmount,
        totalQuantity,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    })
    .promise();
}

/**
 * Handler function to handle login order for API order product
 *
 * @param event - The event from API Gateway
 * @returns - Return an order
 */
export const handler: Handler = async (
  event: APIGatewayEventRequestOrderResource<OrderProduct>
): Promise<ApiResponseCommon> => {
  const client = await PgPool.connect();

  try {
    const { cartItemIds } = event.body;
    const { sub: currentUserId, email } = event.context;

    const cartId = await getByCartId(client, currentUserId);
    const cartItems = await getCartItems(client, cartItemIds, cartId);

    if (!cartItems.length) {
      throw new Error('No valid cart items found');
    }

    if (cartItems.length !== cartItemIds.length) {
      const foundIds = cartItems.map(i => i.id);
      const invalidIds = cartItemIds.filter(id => !foundIds.includes(id));

      throw new Error(`Some cart items are invalid: ${invalidIds.join(', ')}`);
    }

    const invalidItem = cartItems.find(item => item.quantity > item.product_quantity);
    if (invalidItem) {
      throw new Error(
        `Not enough quantity for product ${invalidItem.name}. Available: ${invalidItem.product_quantity}`
      );
    }

    await client.query('BEGIN');

    for (const item of cartItems) {
      await client.query(`
        UPDATE public.product SET quantity = quantity - $1 WHERE id = $2
      `, [item.quantity, item.product_id]);
    }

    let totalAmount = 0;
    let totalQuantity = 0;

    const orderItems = cartItems.map(item => {
      const amount = item.price * item.quantity;
      totalAmount += amount;
      totalQuantity += item.quantity;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        amount
      };
    });

    const orderResult = await client.query(`
      INSERT INTO public.order (owner_id, amount, quantity, status)
      VALUES ($1, $2, $3, 'PENDING') RETURNING id
    `, [currentUserId, totalAmount, totalQuantity]);

    const orderId = orderResult.rows[0].id;

    const values = orderItems.flatMap(item => [orderId, item.product_id, item.quantity, item.amount]);
    const placeholders = orderItems.map((_, i) =>
      `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`
    ).join(', ');

    await client.query(`
      INSERT INTO public.order_item (order_id, product_id, quantity, amount)
      VALUES ${placeholders}
    `, values);

    await client.query(`
      DELETE FROM public.cart_item WHERE id = ANY($1::uuid[])
    `, [cartItemIds]);

    await sendOrderMessage(orderId, email, totalAmount, totalQuantity, cartItems)

    await client.query('COMMIT');

    return {
      statusCode: HttpStatusCode.SUCCESS,
      message: 'Order created successfully',
    };
  } catch (error: any) {
    await client.query('ROLLBACK');

    console.error('Error:', error.message);

    throw new Error(JSON.stringify({
      statusCode: HttpStatusCode.INTERNAL_SEVER_ERROR,
      message: `Failed to create order: ${error.message}`
    }));
  } finally {
    client.release();
  }
};
