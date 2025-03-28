import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';

import { Order } from './order';
import { Product } from './product';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  quantity: number;

  @Column()
  amount: number;

  @Column()
  orderId: string;

  @Column()
  productId: string;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
