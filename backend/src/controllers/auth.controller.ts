import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/responseEnvelope';
import { AuthRequest } from '../middlewares/auth';

const authService = new AuthService();

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    return sendResponse(res, 200, true, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

export const getMeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    return sendResponse(res, 200, true, 'User profile fetched successfully', req.user);
  } catch (err) {
    next(err);
  }
};
