import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Neon DB via pg driver for schema setup...');

    const schemaSql = `
      -- Create Enums if not exist
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "ChallanStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      -- Create User Table
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" "Role" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Customer Table
      CREATE TABLE IF NOT EXISTS "Customer" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "mobile" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "businessName" TEXT NOT NULL,
        "gstNumber" TEXT,
        "customerType" "CustomerType" NOT NULL,
        "address" TEXT NOT NULL,
        "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
        "followUpDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create FollowUpNote Table
      CREATE TABLE IF NOT EXISTS "FollowUpNote" (
        "id" TEXT PRIMARY KEY,
        "customerId" TEXT NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
        "note" TEXT NOT NULL,
        "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Product Table
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "sku" TEXT UNIQUE NOT NULL,
        "category" TEXT NOT NULL,
        "unitPrice" DOUBLE PRECISION NOT NULL,
        "currentStock" INTEGER NOT NULL DEFAULT 0,
        "minStockAlert" INTEGER NOT NULL DEFAULT 5,
        "location" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create StockMovement Table
      CREATE TABLE IF NOT EXISTS "StockMovement" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
        "quantityChanged" INTEGER NOT NULL,
        "movementType" "MovementType" NOT NULL,
        "reason" TEXT NOT NULL,
        "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Challan Table
      CREATE TABLE IF NOT EXISTS "Challan" (
        "id" TEXT PRIMARY KEY,
        "challanNumber" TEXT UNIQUE NOT NULL,
        "customerId" TEXT NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
        "status" "ChallanStatus" NOT NULL DEFAULT 'DRAFT',
        "totalQuantity" INTEGER NOT NULL DEFAULT 0,
        "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create ChallanItem Table
      CREATE TABLE IF NOT EXISTS "ChallanItem" (
        "id" TEXT PRIMARY KEY,
        "challanId" TEXT NOT NULL REFERENCES "Challan"("id") ON DELETE CASCADE,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
        "productNameSnapshot" TEXT NOT NULL,
        "productPriceSnapshot" DOUBLE PRECISION NOT NULL,
        "skuSnapshot" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL
      );
    `;

    await client.query(schemaSql);
    console.log('✅ Database schema created successfully in Neon Postgres!');
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
