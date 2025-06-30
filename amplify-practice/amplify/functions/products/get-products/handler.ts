import { AppSyncResolverEvent, Handler } from 'aws-lambda';

import { getPrismaClient } from '/opt/nodejs/prisma-client.js';

import {
  PaginationArguments,
  PaginationResponse
} from '../../../shared/interfaces/pagination.interface';
import { HttpStatusCode } from '../../../shared/enums/http-status-code.enum';
import { Product } from '../../../shared/interfaces/product.interface';

/**
 * Lambda handler for retrieving all products.
 *
 *  @param event - ListAPIEvent containing pagination and authorization info.
 */
export const handler: Handler = async (
  event: AppSyncResolverEvent<PaginationArguments>
): Promise<PaginationResponse<Product> | void> => {
  console.log('API Get All Product', JSON.stringify(event));

  const page = parseInt(event?.arguments?.page || '1');
  const limit = parseInt(event?.arguments?.limit || '10');
  const offset = (page - 1) * limit;

  try {
    const prisma = await getPrismaClient();

    const res = await prisma.product.findMany({
      skip: offset,
      take: limit
    });
    const totalItems = await prisma.product.count();
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
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Internal server error: ${error.message}`
    }));
  }
};
