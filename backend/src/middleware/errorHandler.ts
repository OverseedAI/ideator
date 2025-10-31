import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isDevelopment } from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { details: err.message }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  res.status(404).json({
    error: 'Route not found',
  });
};
