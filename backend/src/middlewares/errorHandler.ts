import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/responseEnvelope';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, false, err.message, null, err.details || err.message);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendResponse(res, statusCode, false, message, null, message);
};
