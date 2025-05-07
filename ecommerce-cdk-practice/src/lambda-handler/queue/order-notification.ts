import AWS from 'aws-sdk';
import { Handler, SQSEvent } from 'aws-lambda';

import { PgPool } from '/opt/nodejs/index.js';

const ses = new AWS.SES();

export const handler: Handler = async (event: SQSEvent): Promise<SQSEvent> => {
  console.log('Handle Accept Order Notification', JSON.stringify(event));

  try {
    const record = event.Records[0];
    const message = JSON.parse(record.body);
    const { userId } = message;

    if (!userId) {
      throw new Error('User ID is missing in the message');
    }

    const userQuery = `
      SELECT email, name
      FROM public.user
      WHERE id = $1
    `;
    const userResult = await PgPool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const { email, name } = userResult.rows[0];

    const emailBody = `
      <html>
        <body>
          <p>Dear ${name || 'Customer'},</p>
          <p>We are pleased to inform you that your order has been accepted by our team.</p>

          <p>Thank you for shopping with us! If you have any questions, feel free to contact our support team.</p>
          <p>This is an automated message. Please do not reply directly to this email.</p>

          <p>Best regards,<br/>The Ecommerce Team</p>

        </body>
      </html>
    `;

    const emailParams = {
      Source: 'thanhhuyen11cntt1@gmail.com',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Ecommerce - Order Accepted'
        },
        Body: {
          Html: {
            Data: emailBody
          }
        }
      }
    };
    await ses.sendEmail(emailParams).promise();

    return event;
  } catch (error) {
    console.error('Error sending email:', error);

    throw error;
  }
};
