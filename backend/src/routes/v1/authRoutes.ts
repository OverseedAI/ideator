import { Router } from 'express';
import * as authController from '../../controllers/authController';
import { validate } from '../../middleware/validation';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post(
  '/signup',
  validate(authController.signupSchema),
  authController.signup
);

router.post(
  '/login',
  validate(authController.loginSchema),
  authController.login
);

router.get('/me', authenticate, authController.getMe);

export default router;
