import { AppDataSource } from '../config/database';

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) {
    return await AppDataSource.initialize();
  }

  return AppDataSource;
};

export const disconnectDB = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
