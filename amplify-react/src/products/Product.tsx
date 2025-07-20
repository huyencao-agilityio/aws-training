import { generateClient, type GraphQLResult } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

import { getProducts } from './graphql/queries';

const client = generateClient();

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    /**
     * Fetches the products from the database
     */
    const fetchProducts = async () => {
      const session = await fetchAuthSession();
      const isLoggedIn = session.userSub !== undefined;
      const options: any = {
        query: getProducts
      };

      if (!isLoggedIn) {
        options.authMode = 'iam';
      }

      const result = await client.graphql(options);
      const data = (result as GraphQLResult<any>).data;

      setProducts(data.getProducts.items);
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products list</h2>

      <table style={{
        border: '1px solid #ccc',
        borderCollapse: 'collapse',
        width: '100%'
      }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product: any) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
                <td>{product.description}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>
                No result
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
