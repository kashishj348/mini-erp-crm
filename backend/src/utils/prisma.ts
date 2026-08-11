import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const prisma = new PrismaClient({
  log: ['error', 'warn']
});
