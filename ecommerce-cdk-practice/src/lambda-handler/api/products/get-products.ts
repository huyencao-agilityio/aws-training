import { Handler } from 'aws-lambda';

import { PgPool } from '/opt/nodejs/index.js';

import { PaginationResponse } from '@interfaces/pagination.interface';
import {
  APIGatewayEventRequestWithLambdaAuthorizer
 } from '@interfaces/api-gateway-event.interface';

/**
 * Lambda handler for retrieving all products.
 *
 *  @param event - ListAPIEvent containing pagination and authorization info.
 */
export const handler: Handler = async (
  event: APIGatewayEventRequestWithLambdaAuthorizer
): Promise<PaginationResponse | void> => {
  console.log('API Get All Product', JSON.stringify(event));

  const page = parseInt(event.page || '1');
  const limit = parseInt(event.limit || '10');
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT * FROM public.product
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) FROM public.product`;

    const res = await PgPool.query(query, [limit, offset]);
    const countRes = await PgPool.query(countQuery);

    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: limit
      },
      items: res.rows
    };
  } catch (error: any) {
    console.error('Error when getting all products:', error);

    throw new Error(JSON.stringify({
      statusCode: 500,
      message: `Internal server error: ${error.message}`
    }));
  }
};
