import AWS from 'aws-sdk';
import { Handler, ScheduledEvent } from 'aws-lambda';

import { PgPool } from '/opt/nodejs/index.js';

const ses = new AWS.SES();

export const handler: Handler = async (
  event: ScheduledEvent
): Promise<ScheduledEvent> => {
  console.log('Generating weekly top products report:', JSON.stringify(event));

  const defaultEmailAddress = process.env.DEFAULT_EMAIL_ADDRESS || '';
  const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS || '';

  try {
    const weeklyQuery = `
      SELECT p.id, p.name, SUM(oi.quantity) as total_sold
      FROM public.order_item oi
      JOIN public.order o ON oi.order_id = o.id
      JOIN public.product p ON oi.product_id = p.id
      WHERE o.status = 'COMPLETED'
      AND o.completed_at" >= NOW() - INTERVAL '7 days'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10;
    `;
    const weeklyResult = await PgPool.query(weeklyQuery);

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

    for (const product of weeklyResult.rows) {
      emailBody += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${product.name}
            </td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${product.total_sold}
          </td>
        </tr>
      `;
    }

    emailBody += `
          </table>

          <p>Best regards,<br/>Ecommerce System</p>
        </body>
      </html>
    `;

    const emailParams = {
      Source: defaultEmailAddress,
      Destination: {
        ToAddresses: [adminEmailAddress]
      },
      Message: {
        Subject: {
          Data: 'Ecommerce - Weekly Top 10 Best-Selling Products Report'
        },
        Body: {
          Html: { Data: emailBody }
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
