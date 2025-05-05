import { Pool, PoolClient, PoolConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

import 'dotenv/config';

export class PgPool {
  private static instance: Pool;

  private constructor() {}

  /**
   * Get instance from Pool
   */
  public static getInstance(): Pool {
    if (!PgPool.instance) {
      const config: PoolConfig = {
        host: process.env.DB_HOST,
        port: 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(path.join(__dirname, 'certs', 'us-east-1-bundle.pem')).toString()
        },
      };

      PgPool.instance = new Pool(config);
    }

    return PgPool.instance;
  }

  /**
   * Query data in database
   */
  static async query(text: string, params?: any[]) {
    const pool = PgPool.getInstance();

    return pool.query(text, params);
  }

  /**
   * Connect to Pool
   */
  static async connect(): Promise<PoolClient> {
    const pool = PgPool.getInstance();
    return pool.connect();
  }
}
