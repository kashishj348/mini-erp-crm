import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('PG CONNECTED SUCCESSFULLY!');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
  } catch (err) {
    console.error('PG ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
