import { randomUUID } from 'crypto';
import { AppError } from '../utils/AppError';
import { ChallanRepository } from '../repositories/challan.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { ChallanCreateInput, ChallanQueryInput } from '../dto/challan.dto';
import { pool } from '../utils/prisma';

export class ChallanService {
  private challanRepo: ChallanRepository;
  private productRepo: ProductRepository;
  private customerRepo: CustomerRepository;

  constructor() {
    this.challanRepo = new ChallanRepository();
    this.productRepo = new ProductRepository();
    this.customerRepo = new CustomerRepository();
  }

  async list(input: ChallanQueryInput) {
    return this.challanRepo.list({ page: input.page, limit: input.limit, status: input.status });
  }

  async getById(id: string) {
    const challan = await this.challanRepo.findById(id);
    if (!challan) throw new AppError('Challan not found', 404);
    const items = await this.challanRepo.listItems(id);
    return { ...challan, items };
  }

  async create(input: ChallanCreateInput, userId: string) {
    const customer = await this.customerRepo.findById(input.customerId);
    if (!customer) throw new AppError('Customer not found', 404);

    const challanNumber = await this.generateChallanNumber();
    const challan = await this.challanRepo.create({
      challanNumber,
      customerId: input.customerId,
      status: 'DRAFT',
      totalQuantity: input.items.reduce((sum, item) => sum + item.quantity, 0),
      createdBy: userId
    } as any);

    for (const item of input.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }
      await this.challanRepo.createItem({
        challanId: challan.id,
        productId: item.productId,
        productNameSnapshot: product.name,
        productPriceSnapshot: product.unitPrice,
        skuSnapshot: product.sku,
        quantity: item.quantity
      });
    }

    return challan;
  }

  async confirm(id: string, userId: string) {
    const challan = await this.challanRepo.findById(id);
    if (!challan) throw new AppError('Challan not found', 404);
    if (challan.status !== 'DRAFT') {
      throw new AppError('Only draft challans can be confirmed', 409);
    }

    const items = await this.challanRepo.listItems(id);
    if (items.length === 0) throw new AppError('Challan has no items', 409);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const stockChecks: string[] = [];
      const productUpdates: Array<{ id: string; newStock: number; quantity: number }> = [];

      for (const item of items) {
        const productRes = await client.query(`SELECT id, "currentStock", name FROM "Product" WHERE id = $1 FOR UPDATE`, [item.productId]);
        const product = productRes.rows[0];
        if (!product) {
          await client.query('ROLLBACK');
          throw new AppError(`Product not found: ${item.productId}`, 404);
        }
        if (product.currentStock < item.quantity) {
          stockChecks.push(`${product.name} (available: ${product.currentStock}, requested: ${item.quantity})`);
        } else {
          productUpdates.push({ id: product.id, newStock: product.currentStock - item.quantity, quantity: item.quantity });
        }
      }

      if (stockChecks.length > 0) {
        await client.query('ROLLBACK');
        throw new AppError(`Insufficient stock for: ${stockChecks.join(', ')}`, 409);
      }

      for (const update of productUpdates) {
        await client.query(`UPDATE "Product" SET "currentStock" = $1 WHERE id = $2`, [update.newStock, update.id]);
        await client.query(
          `INSERT INTO "StockMovement" (id, "productId", "quantityChanged", "movementType", reason, "createdBy") VALUES ($1, $2, $3, $4, $5, $6)`,
          [this.generateId(), update.id, -update.quantity, 'OUT', `Challan confirmation ${challan.challanNumber}`, userId]
        );
      }

      await client.query(`UPDATE "Challan" SET status = 'CONFIRMED' WHERE id = $1`, [id]);
      await client.query('COMMIT');
      return this.challanRepo.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancel(id: string) {
    const challan = await this.challanRepo.findById(id);
    if (!challan) throw new AppError('Challan not found', 404);
    if (challan.status === 'CANCELLED') throw new AppError('Challan already cancelled', 409);
    return this.challanRepo.update(id, { status: 'CANCELLED' } as any);
  }

  private async generateChallanNumber() {
    const prefix = 'CHL';
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    let counter = 1;
    while (true) {
      const candidate = `${prefix}-${stamp}-${String(counter).padStart(4, '0')}`;
      const existing = await this.challanRepo.findExistingChallanNumber(candidate);
      if (!existing) return candidate;
      counter += 1;
    }
  }

  private generateId() {
    return `movement_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
