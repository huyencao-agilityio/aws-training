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

  @Column()
  owner_id: string;

  @Column()
  amount: number;

  @Column()
  quantity: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  user: User;

  @OneToMany(() => OrderItem, (order_item) => order_item.order, {
    eager: true,
    cascade: true
  })
  order_items: OrderItem[];
}
