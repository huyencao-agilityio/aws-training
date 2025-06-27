import { a } from '@aws-amplify/backend';

export const PaginationRequest = {
  limit: a.integer(),
  offset: a.integer(),
};

export const ProductRequest = {
  ...PaginationRequest,
};
