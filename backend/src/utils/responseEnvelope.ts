import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null,
  error: any = null
) => {
  const payload: ApiResponse<T> = {
    success,
    message
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  if (error !== null && error !== undefined) {
    payload.error = error;
  }

  return res.status(statusCode).json(payload);
};
