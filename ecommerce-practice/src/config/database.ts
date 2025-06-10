import 'reflect-metadata';
import 'dotenv/config';
import * as fs from 'fs';
import { DataSource } from 'typeorm';

import { User } from '../entities/user';
import { Product } from '../entities/product';
import { Order } from '../entities/order';
import { OrderItem } from '../entities/order-item';
import { Cart } from '../entities/cart';
import { CartItem } from '../entities/cart-item';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./certs/us-east-1-bundle.pem')
  },
  logging: true,
  entities: [User, Product, Order, OrderItem, Cart, CartItem],
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
});
