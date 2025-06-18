import { PrismaClient } from '@prisma/client';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();
let prisma: PrismaClient | null = null;

/**
 * Get a Prisma client instance
 *
 * @returns The Prisma client instance
 */
export async function getPrismaClient(): Promise<PrismaClient> {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      // Get the secret value from the secret manager
      const secret = await secretsManager.getSecretValue({
        SecretId: process.env.SECRET_NAME!,
      }).promise();

      // Parse the secret value
      const { password, username } = JSON.parse(secret.SecretString!);

      const dbHost = process.env.DB_HOST;
      const dbPort = process.env.DB_PORT || '5432';

      // Set the database URL
      process.env.DATABASE_URL = `postgresql://${username}:${password}@${dbHost}:${dbPort}/postgres`;
    }

    prisma = new PrismaClient();
  }

  return prisma;
}

export { PrismaClient } from '@prisma/client';
