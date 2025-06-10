import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';

import { User } from './user';
import { OrderItem } from './order-item';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  owner_id: string;

  @Column('int')
  amount: number;

  @Column('int')
  quantity: number;

  @Column('varchar')
  status: string;

  @Column('timestamp', { nullable: true })
  completed_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  user: User;

  @OneToMany(() => OrderItem, (order_item) => order_item.order, {
    eager: true,
    cascade: true
  })
  order_items: OrderItem[];
}
