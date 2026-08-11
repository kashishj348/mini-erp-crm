import bcrypt from 'bcryptjs';
import { pool } from './utils/prisma';

const testUsers = [
  {
    id: 'user-admin-01',
    name: 'System Admin',
    email: 'admin@erp.com',
    password: 'Admin@123',
    role: 'ADMIN'
  },
  {
    id: 'user-sales-01',
    name: 'Sales Manager',
    email: 'sales@erp.com',
    password: 'Sales@123',
    role: 'SALES'
  },
  {
    id: 'user-warehouse-01',
    name: 'Warehouse Operator',
    email: 'warehouse@erp.com',
    password: 'Warehouse@123',
    role: 'WAREHOUSE'
  },
  {
    id: 'user-accounts-01',
    name: 'Accounts Executive',
    email: 'accounts@erp.com',
    password: 'Accounts@123',
    role: 'ACCOUNTS'
  }
];

async function seed() {
  console.log('🌱 Starting database seed...');
  try {
    for (const u of testUsers) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await pool.query(
        `INSERT INTO "User" (id, name, email, "passwordHash", role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE 
         SET name = EXCLUDED.name, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role`,
        [u.id, u.name, u.email.toLowerCase().trim(), passwordHash, u.role]
      );
      console.log(`✅ Seeded user: ${u.email} (${u.role})`);
    }
    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
