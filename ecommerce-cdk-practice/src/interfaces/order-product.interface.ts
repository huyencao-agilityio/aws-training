/**
 * Define interface for order product
 */
export interface OrderProduct {
  cartItemIds: string[];
}

/**
 * Define interface for an order
 */
export interface Order {
  owner_id: string;
  amount: number;
  quantity: number;
  status: string;
  completed_at: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Define interface for an order item
 */
export interface OrderItem {
  order_id: string;
  amount: number;
  quantity: number;
  product_id: string;
  created_at: Date;
  updated_at: Date;
}
