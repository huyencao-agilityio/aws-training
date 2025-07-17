export const getProducts = `
  query GetProducts {
    getProducts {
      items {
        id
        name
        description
        price
        quantity
      }
    }
  }
`;
