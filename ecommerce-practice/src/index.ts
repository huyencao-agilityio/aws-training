import { AppDataSource } from './config/database';

AppDataSource.initialize()
  .then(() => {
    console.log('Connect to RDS PostgreSQL successfully!');
  })
  .catch((error) => {
    console.error('Has error connect:', error);
  });
