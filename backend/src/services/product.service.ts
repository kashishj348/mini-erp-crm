import { randomUUID } from 'crypto';
import { AppError } from '../utils/AppError';
import { ProductRepository } from '../repositories/product.repository';
import { ProductCreateInput, ProductUpdateInput, ProductQueryInput, StockAdjustmentInput } from '../dto/product.dto';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async list(input: ProductQueryInput) {
    return this.productRepo.list({ page: input.page, limit: input.limit, search: input.search });
  }

  async getById(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    const stockMovements = await this.productRepo.listStockMovements(id);
    return { ...product, stockMovements };
  }

  async create(input: ProductCreateInput) {
    const existing = await this.productRepo.findBySku(input.sku);
    if (existing) throw new AppError('Product SKU already exists', 409);

    return this.productRepo.create({
      id: randomUUID(),
      name: input.name,
      sku: input.sku,
      category: input.category,
      unitPrice: input.unitPrice,
      currentStock: input.currentStock ?? 0,
      minStockAlert: input.minStockAlert ?? 5,
      location: input.location,
      createdAt: new Date()
    } as any);
  }

  async update(id: string, input: ProductUpdateInput) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    if (input.sku && input.sku !== product.sku) {
      const existing = await this.productRepo.findBySku(input.sku);
      if (existing) throw new AppError('Product SKU already exists', 409);
    }

    return this.productRepo.update(id, input as any);
  }

  async adjustStock(id: string, input: StockAdjustmentInput, userId: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    if (input.movementType === 'OUT') {
      if (product.currentStock < input.quantity) {
        throw new AppError(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}`, 409);
      }
      const nextStock = product.currentStock - input.quantity;
      await this.productRepo.update(id, { currentStock: nextStock } as any);
      await this.productRepo.createStockMovement({
        productId: id,
        quantityChanged: -input.quantity,
        movementType: 'OUT',
        reason: input.reason,
        createdBy: userId
      });
    } else {
      const nextStock = product.currentStock + input.quantity;
      await this.productRepo.update(id, { currentStock: nextStock } as any);
      await this.productRepo.createStockMovement({
        productId: id,
        quantityChanged: input.quantity,
        movementType: 'IN',
        reason: input.reason,
        createdBy: userId
      });
    }

    return this.productRepo.findById(id);
  }
}
