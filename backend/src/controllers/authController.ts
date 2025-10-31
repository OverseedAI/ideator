import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/authService';

const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const signup = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    const result = await authService.signup({ email, password, name });

    res.status(201).json(result);
  }
);

export const login = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  }
);

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await authService.getMe(userId);

    res.status(200).json(user);
  }
);

export { signupSchema, loginSchema };
