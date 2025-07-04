import AWS from 'aws-sdk';
import { Handler, ScheduledEvent } from 'aws-lambda';

import { getPrismaClient, PrismaClient } from '/opt/nodejs/prisma-client.js';

import { OrderStatus } from '../../shared/enums/order-status.enum';
import { Order, OrderItem } from '../../shared/interfaces/order.interface';
import { Product } from '../../shared/interfaces/product.interface';

const ses = new AWS.SES();

/**
 * Get completed orders
 *
 * @param prisma - The Prisma client
 * @returns The completed orders
 */
const getCompletedOrders = async (
  prisma: PrismaClient
): Promise<Order[]> => {
  // Get completed orders in the past 7 days
  const completedOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.COMPLETED,
      completed_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: { id: true },
  });

  return completedOrders;
}

/**
 * Get top order items
 *
 * @param prisma - The Prisma client
 * @param orderIds - The order ids
 * @returns The top order items
 */
const getTopOrderItems = async (
  prisma: PrismaClient,
  orderIds: string[]
): Promise<OrderItem[]> => {
  const orderItems = await prisma.orderItem.groupBy({
    by: ['product_id'],
    where: {
      orderId: { in: orderIds },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: { quantity: 'desc' },
    },
    take: 10,
  });

  return orderItems;
}

/**
 * Get list product
 *
 * @param prisma - The Prisma client
 * @param productIds - The product ids
 * @returns The list product
 */
const getListProduct = async (
  prisma: PrismaClient,
  productIds: string[]
): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return products;
}

export const handler: Handler = async (
  event: ScheduledEvent
): Promise<ScheduledEvent> => {
  console.log('Generating weekly top products report:', JSON.stringify(event));

  const defaultEmailAddress = process.env.DEFAULT_EMAIL_ADDRESS || '';
  const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS || '';

  try {
    const prisma = await getPrismaClient();

    // Get completed orders in the past 7 days
    const completedOrders = await getCompletedOrders(prisma);

    // Get order ids
    const orderIds = completedOrders.map(order => order.id);

    // Don't send email if there are no completed orders
    if (orderIds.length === 0) {
      console.log('No completed orders in the past 7 days.');

      return event;
    }

    // Get top order items
    const topOrderItems = await getTopOrderItems(prisma, orderIds);

    const productIds = topOrderItems.map(item => item.product_id);

    // Get product names
    const products = await getListProduct(prisma, productIds);

    const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));

    // Create email body
    let emailBody = `
      <html>
        <body>
          <p>Dear Admin,</p>
          <p>Here are the top 10 best-selling products for the past week:</p>
          <h3>Top 10 Products - Past Week</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Product Name</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total Sold</th>
            </tr>
    `;

    for (const item of topOrderItems) {
      const name = productMap[item.product_id] ?? 'Unknown';
      const quantity = item.quantity ?? 0;
      emailBody += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${quantity}</td>
        </tr>
      `;
    }

    emailBody += `
          </table>
          <p>Best regards,<br/>Ecommerce System</p>
        </body>
      </html>
    `;

    // Send email by AWS SES
    const emailParams = {
      Source: defaultEmailAddress,
      Destination: {
        ToAddresses: [adminEmailAddress],
      },
      Message: {
        Subject: {
          Data: 'Ecommerce - Weekly Top 10 Best-Selling Products Report',
        },
        Body: {
          Html: { Data: emailBody },
        },
      },
    };

    await ses.sendEmail(emailParams).promise();
    console.log('Report email sent successfully');

    return event;
  } catch (error: any) {
    console.error('Error generating report:', error);
    throw error;
  }
};
