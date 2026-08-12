import { Router } from 'express';
import { createProductController, getProductController, listProductsController, updateProductController, adjustStockController } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import { productCreateDto, productQueryDto, productUpdateDto, stockAdjustmentDto } from '../dto/product.dto';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), validateQuery(productQueryDto), listProductsController);
router.post('/', authenticate, requireRole('ADMIN', 'WAREHOUSE'), validate(productCreateDto), createProductController);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getProductController);
router.patch('/:id', authenticate, requireRole('ADMIN', 'WAREHOUSE'), validate(productUpdateDto), updateProductController);
router.post('/:id/adjust-stock', authenticate, requireRole('ADMIN', 'WAREHOUSE'), validate(stockAdjustmentDto), adjustStockController);

export default router;
