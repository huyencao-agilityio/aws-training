import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';

import { User } from './user';
import { CartItem } from './cart-item';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_id: string;

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  user: User;

  @OneToMany(() => CartItem, (cart_item) => cart_item.cart, {
    eager: true,
    cascade: true
  })
  cart_items: CartItem[];
}
