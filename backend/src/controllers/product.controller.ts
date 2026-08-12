import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendResponse } from '../utils/responseEnvelope';
import { AuthRequest } from '../middlewares/auth';

const productService = new ProductService();

export const listProductsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.list(req.query as any);
    return sendResponse(res, 200, true, 'Products fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.create(req.body);
    return sendResponse(res, 201, true, 'Product created successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.getById(req.params.id);
    return sendResponse(res, 200, true, 'Product fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const updateProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.update(req.params.id, req.body);
    return sendResponse(res, 200, true, 'Product updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const adjustStockController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await productService.adjustStock(req.params.id, req.body, req.user?.userId || 'system');
    return sendResponse(res, 200, true, 'Stock adjusted successfully', result);
  } catch (err) {
    next(err);
  }
};
