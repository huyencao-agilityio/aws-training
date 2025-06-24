"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = void 0;
exports.getPrismaClient = getPrismaClient;
const client_1 = require("@prisma/client");
const aws_sdk_1 = require("aws-sdk");
const secretsManager = new aws_sdk_1.SecretsManager();
let prisma = null;
/**
 * Get a Prisma client instance
 *
 * @returns The Prisma client instance
 */
async function getPrismaClient() {
    if (!prisma) {
        if (!process.env.DATABASE_URL) {
            const secret = await secretsManager.getSecretValue({
                SecretId: process.env.SECRET_NAME,
            }).promise();
            const { password, username } = JSON.parse(secret.SecretString);
            const dbHost = process.env.DB_HOST;
            const dbPort = process.env.DB_PORT || '5432';
            process.env.DATABASE_URL = `postgresql://${username}:${password}@${dbHost}:${dbPort}/postgres`;
        }
        prisma = new client_1.PrismaClient();
    }
    return prisma;
}
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_2.PrismaClient; } });
