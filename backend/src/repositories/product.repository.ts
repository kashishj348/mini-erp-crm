import { pool } from '../utils/prisma';

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: Date;
}

export class ProductRepository {
  async list(params: { page: number; limit: number; search?: string }) {
    const values: any[] = [];
    let whereClause = '';

    if (params.search) {
      values.push(`%${params.search}%`);
      whereClause = `WHERE "name" ILIKE $1 OR "sku" ILIKE $1 OR "category" ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM "Product" ${whereClause}`, values);
    const total = countRes.rows[0].count;

    values.push(params.limit, (params.page - 1) * params.limit);
    const rows = await pool.query(
      `SELECT * FROM "Product" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return {
      items: rows.rows as ProductRecord[],
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit)
    };
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const res = await pool.query(`SELECT * FROM "Product" WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async findBySku(sku: string): Promise<ProductRecord | null> {
    const res = await pool.query(`SELECT * FROM "Product" WHERE sku = $1`, [sku.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  async create(input: { id: string; name: string; sku: string; category: string; unitPrice: number; currentStock: number; minStockAlert: number; location: string; createdAt: Date }): Promise<ProductRecord> {
    const res = await pool.query(
      `INSERT INTO "Product" (id, name, sku, category, "unitPrice", "currentStock", "minStockAlert", location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [input.id, input.name, input.sku.toLowerCase().trim(), input.category, input.unitPrice, input.currentStock, input.minStockAlert, input.location]
    );
    return res.rows[0];
  }

  async update(id: string, input: Partial<Omit<ProductRecord, 'id' | 'createdAt'>>): Promise<ProductRecord | null> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined) return;
      const column = key === 'unitPrice' ? 'unitPrice' : key === 'currentStock' ? 'currentStock' : key === 'minStockAlert' ? 'minStockAlert' : key;
      updates.push(`"${column}" = $${updates.length + 1}`);
      values.push(value);
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const res = await pool.query(
      `UPDATE "Product" SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  }

  async listStockMovements(productId: string) {
    const res = await pool.query(
      `SELECT sm.*, u.name AS "createdByName" FROM "StockMovement" sm JOIN "User" u ON sm."createdBy" = u.id WHERE sm."productId" = $1 ORDER BY sm."createdAt" DESC`,
      [productId]
    );
    return res.rows;
  }

  async createStockMovement(input: { productId: string; quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string; createdBy: string }) {
    const res = await pool.query(
      `INSERT INTO "StockMovement" (id, "productId", "quantityChanged", "movementType", reason, "createdBy") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [this.generateId(), input.productId, input.quantityChanged, input.movementType, input.reason, input.createdBy]
    );
    return res.rows[0];
  }

  private generateId() {
    return `movement_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
