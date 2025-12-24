/**
 * 认证路由
 */
import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 受保护路由
router.get('/profile', authenticate, getProfile);

export default router;
