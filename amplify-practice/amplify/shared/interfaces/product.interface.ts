/**
 * Define interface for product
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}
