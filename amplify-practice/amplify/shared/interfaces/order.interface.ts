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
  id: string;
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
  id: string;
  quantity: number;
  amount: number;
  order_id: string;
  product_id: string;
  created_at: Date;
  updated_at: Date;
}
