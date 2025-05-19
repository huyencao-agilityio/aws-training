import { Handler, SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';

import {
  ADMIN_EMAIL_ADDRESS,
  DEFAULT_EMAIL_ADDRESS
} from '@constants/email.constant';

const ses = new AWS.SES();

export const handler: Handler = async (event: SQSEvent): Promise<SQSEvent> => {
  console.log('Handle Order Notification', JSON.stringify(event));

  try {
    const record = event.Records[0];
    const message = JSON.parse(record.body);
    const { orderId, email, totalAmount, totalQuantity, items } = message;

    const emailParams = {
      Source: DEFAULT_EMAIL_ADDRESS,
      Destination: {
        ToAddresses: [ADMIN_EMAIL_ADDRESS]
      },
      Message: {
        Subject: {
          Data: 'Ecommerce - New Order Placed'
        },
        Body: {
          Html: {
            Data: `
              <p>Hi Admin,</p>
              <p>A new order has been placed by a user. Below are the details of the order:</p>

              <p><strong>User:</strong> ${email}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total Amount:</strong> $${totalAmount}</p>
              <p><strong>Total Quantity:</strong> ${totalQuantity}</p>

              <h3>Products:</h3>
              <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">$${item.price}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">$${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <p>Please review the order and take any necessary actions.</p>

              <p>Best regards,</p>
              <p>Your system</p>
            `
          }
        }
      }
    };
    await ses.sendEmail(emailParams).promise();

    return event;
  } catch (error: any) {
    console.error('Error sending email:', error);

    throw error;
  }
};
