import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendResponse } from '../utils/responseEnvelope';
import { AuthRequest } from '../middlewares/auth';

const challanService = new ChallanService();

export const listChallansController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await challanService.list(req.query as any);
    return sendResponse(res, 200, true, 'Challans fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const createChallanController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await challanService.create(req.body, req.user?.userId || 'system');
    return sendResponse(res, 201, true, 'Challan created successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getChallanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await challanService.getById(req.params.id);
    return sendResponse(res, 200, true, 'Challan fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const confirmChallanController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await challanService.confirm(req.params.id, req.user?.userId || 'system');
    return sendResponse(res, 200, true, 'Challan confirmed successfully', result);
  } catch (err) {
    next(err);
  }
};

export const cancelChallanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await challanService.cancel(req.params.id);
    return sendResponse(res, 200, true, 'Challan cancelled successfully', result);
  } catch (err) {
    next(err);
  }
};
