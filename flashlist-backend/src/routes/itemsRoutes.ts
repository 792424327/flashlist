/**
 * 待办事项路由
 */
import { Router } from 'express';
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} from '../controllers/itemsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 待办事项CRUD
router.get('/', getAllItems);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

// 批量更新排序
router.put('/reorder', reorderItems);

export default router;
