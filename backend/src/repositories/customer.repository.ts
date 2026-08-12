import { pool } from '../utils/prisma';

export interface CustomerRecord {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: Date | null;
  createdAt: Date;
}

export class CustomerRepository {
  async list(params: { page: number; limit: number; search?: string }) {
    const values: any[] = [];
    let whereClause = '';

    if (params.search) {
      values.push(`%${params.search}%`);
      whereClause = `WHERE "name" ILIKE $1 OR "mobile" ILIKE $1 OR "email" ILIKE $1 OR "businessName" ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM "Customer" ${whereClause}`, values);
    const total = countRes.rows[0].count;

    values.push(params.limit, (params.page - 1) * params.limit);
    const rows = await pool.query(
      `SELECT * FROM "Customer" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return {
      items: rows.rows as CustomerRecord[],
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit)
    };
  }

  async findById(id: string): Promise<CustomerRecord | null> {
    const res = await pool.query(`SELECT * FROM "Customer" WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async create(input: { id: string; name: string; mobile: string; email: string; businessName: string; gstNumber?: string | null; customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR'; address: string; status: 'LEAD' | 'ACTIVE' | 'INACTIVE'; followUpDate?: Date | null; createdAt: Date }): Promise<CustomerRecord> {
    const res = await pool.query(
      `INSERT INTO "Customer" (id, name, mobile, email, "businessName", "gstNumber", "customerType", address, status, "followUpDate")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        input.id,
        input.name,
        input.mobile,
        input.email.toLowerCase().trim(),
        input.businessName,
        input.gstNumber ?? null,
        input.customerType,
        input.address,
        input.status,
        input.followUpDate ?? null
      ]
    );
    return res.rows[0];
  }

  async update(id: string, input: Partial<Omit<CustomerRecord, 'id' | 'createdAt'>>): Promise<CustomerRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined) return;
      const column = this.toColumnName(key);
      updates.push(`"${column}" = $${updates.length + 1}`);
      values.push(value);
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const res = await pool.query(
      `UPDATE "Customer" SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM "Customer" WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async listNotes(customerId: string) {
    const res = await pool.query(
      `SELECT fn.*, u.name AS "createdByName" FROM "FollowUpNote" fn JOIN "User" u ON fn."createdBy" = u.id WHERE fn."customerId" = $1 ORDER BY fn."createdAt" DESC`,
      [customerId]
    );
    return res.rows;
  }

  async createNote(customerId: string, note: string, createdBy: string) {
    const res = await pool.query(
      `INSERT INTO "FollowUpNote" (id, "customerId", note, "createdBy") VALUES ($1, $2, $3, $4) RETURNING *`,
      [this.generateId(), customerId, note, createdBy]
    );
    return res.rows[0];
  }

  private toColumnName(key: string): string {
    const map: Record<string, string> = {
      businessName: 'businessName',
      gstNumber: 'gstNumber',
      customerType: 'customerType',
      followUpDate: 'followUpDate'
    };
    return map[key] ?? key;
  }

  private generateId() {
    return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
