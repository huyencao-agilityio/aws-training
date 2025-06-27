import { a } from '@aws-amplify/backend';

export const Product = a.customType({
  id: a.string(),
  name: a.string(),
  price: a.integer(),
  description: a.string(),
  image: a.string(),
});

export const ProductResponse = a.customType({
  pagination: a.customType({
    currentPage: a.integer(),
    totalPages: a.integer(),
    totalItems: a.integer(),
    itemsPerPage: a.integer()
  }),
  items: a.ref('Product').array()
});
