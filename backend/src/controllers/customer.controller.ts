import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendResponse } from '../utils/responseEnvelope';
import { AuthRequest } from '../middlewares/auth';

const customerService = new CustomerService();

export const listCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.list(req.query as any);
    return sendResponse(res, 200, true, 'Customers fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const createCustomerController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.create(req.body, req.user?.userId || 'system');
    return sendResponse(res, 201, true, 'Customer created successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.getById(req.params.id);
    return sendResponse(res, 200, true, 'Customer fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const updateCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.update(req.params.id, req.body);
    return sendResponse(res, 200, true, 'Customer updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const deleteCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.remove(req.params.id);
    return sendResponse(res, 200, true, 'Customer deleted successfully', result);
  } catch (err) {
    next(err);
  }
};

export const createFollowUpController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.addFollowUp(req.params.id, req.body, req.user?.userId || 'system');
    return sendResponse(res, 201, true, 'Follow-up note created successfully', result);
  } catch (err) {
    next(err);
  }
};

export const listFollowUpsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.listFollowUps(req.params.id);
    return sendResponse(res, 200, true, 'Follow-up notes fetched successfully', result);
  } catch (err) {
    next(err);
  }
};
