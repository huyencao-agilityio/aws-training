/**
 * Define the interface for cart
 */
export interface Cart {
  owner_id: string;
  created_at: Date;
  updated_at: Date;
};

/**
 * Define interface for result when query cart item and product
 */
export interface CartItemAndProduct {
  // Cart item info
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  // Product info
  product_quantity: number;
  name: string;
  price: number;
};
