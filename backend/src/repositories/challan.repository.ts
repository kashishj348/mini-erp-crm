import { pool } from '../utils/prisma';

export interface ChallanRecord {
  id: string;
  challanNumber: string;
  customerId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQuantity: number;
  createdBy: string;
  createdAt: Date;
}

export class ChallanRepository {
  async list(params: { page: number; limit: number; status?: string }) {
    const values: any[] = [];
    let whereClause = '';

    if (params.status) {
      values.push(params.status);
      whereClause = `WHERE status = $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM "Challan" ${whereClause}`, values);
    const total = countRes.rows[0].count;

    values.push(params.limit, (params.page - 1) * params.limit);
    const rows = await pool.query(
      `SELECT * FROM "Challan" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return {
      items: rows.rows as ChallanRecord[],
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit)
    };
  }

  async findById(id: string) {
    const res = await pool.query(`SELECT * FROM "Challan" WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async create(input: Omit<ChallanRecord, 'id' | 'createdAt'> & { challanNumber: string }) {
    const res = await pool.query(
      `INSERT INTO "Challan" (id, "challanNumber", "customerId", status, "totalQuantity", "createdBy") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [this.generateId(), input.challanNumber, input.customerId, input.status, input.totalQuantity, input.createdBy]
    );
    return res.rows[0];
  }

  async update(id: string, input: Partial<ChallanRecord>) {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined) return;
      const column = key === 'challanNumber' ? 'challanNumber' : key === 'customerId' ? 'customerId' : key === 'status' ? 'status' : key === 'totalQuantity' ? 'totalQuantity' : key;
      updates.push(`"${column}" = $${updates.length + 1}`);
      values.push(value);
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const res = await pool.query(`UPDATE "Challan" SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    return res.rows[0] || null;
  }

  async createItem(input: { challanId: string; productId: string; productNameSnapshot: string; productPriceSnapshot: number; skuSnapshot: string; quantity: number }) {
    const res = await pool.query(
      `INSERT INTO "ChallanItem" (id, "challanId", "productId", "productNameSnapshot", "productPriceSnapshot", "skuSnapshot", quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [this.generateId(), input.challanId, input.productId, input.productNameSnapshot, input.productPriceSnapshot, input.skuSnapshot, input.quantity]
    );
    return res.rows[0];
  }

  async listItems(challanId: string) {
    const res = await pool.query(`SELECT * FROM "ChallanItem" WHERE "challanId" = $1`, [challanId]);
    return res.rows;
  }

  async findExistingChallanNumber(challanNumber: string) {
    const res = await pool.query(`SELECT id FROM "Challan" WHERE "challanNumber" = $1`, [challanNumber]);
    return res.rows[0] || null;
  }

  private generateId() {
    return `challan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
