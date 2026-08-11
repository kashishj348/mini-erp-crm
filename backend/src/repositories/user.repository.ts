import { pool } from '../utils/prisma';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  createdAt: Date;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const res = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [email.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const res = await pool.query(`SELECT * FROM "User" WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async createUser(user: { id: string; name: string; email: string; passwordHash: string; role: string }): Promise<UserRow> {
    const res = await pool.query(
      `INSERT INTO "User" (id, name, email, "passwordHash", role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, user.name, user.email.toLowerCase().trim(), user.passwordHash, user.role]
    );
    return res.rows[0];
  }
}
