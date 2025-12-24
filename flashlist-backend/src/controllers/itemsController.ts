/**
 * 待办事项控制器
 */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/db.js';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  CreateItemRequest,
  UpdateItemRequest,
  ReorderItemsRequest,
  FlashListItem,
} from '../types/index.js';

/**
 * 将数据库模型转换为API响应格式
 */
function sanitizeItem(item: any): FlashListItem {
  return {
    id: item.id,
    text: item.text,
    completed: item.completed,
    level: item.level,
    type: item.type,
    createdAt: Number(item.createdAt),
    order: item.orderIndex,
  };
}

/**
 * 获取所有待办事项
 */
export async function getAllItems(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    const items = await prisma.flashListItem.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return res.status(200).json(
      createSuccessResponse(items.map(sanitizeItem), '获取成功')
    );
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json(
      createErrorResponse(500, '获取待办事项失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 创建待办事项
 */
export async function createItem(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    const { text = '', level = 0, type = 'task', afterId } = req.body as CreateItemRequest;

    // 验证level范围
    if (level < 0 || level > 4) {
      return res.status(400).json(
        createErrorResponse(400, '缩进级别必须在0-4之间', ErrorCode.INVALID_PARAMS)
      );
    }

    // 验证type
    if (type !== 'task' && type !== 'header') {
      return res.status(400).json(
        createErrorResponse(400, '类型必须是task或header', ErrorCode.INVALID_PARAMS)
      );
    }

    // 计算orderIndex
    let orderIndex: number;

    if (afterId) {
      const afterItem = await prisma.flashListItem.findFirst({
        where: { id: afterId, userId },
      });

      if (afterItem) {
        orderIndex = Number(afterItem.orderIndex) + 0.5;
      } else {
        // afterId无效，添加到末尾
        const lastItem = await prisma.flashListItem.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { orderIndex: 'desc' },
        });
        orderIndex = lastItem ? Number(lastItem.orderIndex) + 1 : 0;
      }
    } else {
      // 添加到末尾
      const lastItem = await prisma.flashListItem.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = lastItem ? Number(lastItem.orderIndex) + 1 : 0;
    }

    const now = BigInt(Date.now());

    const item = await prisma.flashListItem.create({
      data: {
        id: uuidv4(),
        userId,
        text,
        level,
        type,
        orderIndex,
        createdAt: now,
        updatedAt: now,
      },
    });

    return res.status(201).json(
      createSuccessResponse(sanitizeItem(item), '创建成功')
    );
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json(
      createErrorResponse(500, '创建待办事项失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 更新待办事项
 */
export async function updateItem(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    const updates = req.body as UpdateItemRequest;

    // 验证level范围
    if (updates.level !== undefined && (updates.level < 0 || updates.level > 4)) {
      return res.status(400).json(
        createErrorResponse(400, '缩进级别必须在0-4之间', ErrorCode.INVALID_PARAMS)
      );
    }

    // 验证type
    if (updates.type !== undefined && updates.type !== 'task' && updates.type !== 'header') {
      return res.status(400).json(
        createErrorResponse(400, '类型必须是task或header', ErrorCode.INVALID_PARAMS)
      );
    }

    // 检查item是否存在且属于当前用户
    const existingItem = await prisma.flashListItem.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existingItem) {
      return res.status(404).json(
        createErrorResponse(404, '待办事项不存在', ErrorCode.ITEM_NOT_FOUND)
      );
    }

    // 更新item
    const item = await prisma.flashListItem.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: BigInt(Date.now()),
      },
    });

    return res.status(200).json(
      createSuccessResponse(sanitizeItem(item), '更新成功')
    );
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json(
      createErrorResponse(500, '更新待办事项失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 删除待办事项
 */
export async function deleteItem(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    // 检查item是否存在且属于当前用户
    const existingItem = await prisma.flashListItem.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existingItem) {
      return res.status(404).json(
        createErrorResponse(404, '待办事项不存在', ErrorCode.ITEM_NOT_FOUND)
      );
    }

    // 检查是否是最后一项
    const itemCount = await prisma.flashListItem.count({
      where: { userId, deletedAt: null },
    });

    if (itemCount <= 1) {
      return res.status(409).json(
        createErrorResponse(409, '不能删除最后一项', ErrorCode.CONFLICT)
      );
    }

    // 软删除
    await prisma.flashListItem.update({
      where: { id },
      data: {
        deletedAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
    });

    return res.status(200).json(
      createSuccessResponse({ id }, '删除成功')
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json(
      createErrorResponse(500, '删除待办事项失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 批量更新排序
 */
export async function reorderItems(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    const { items } = req.body as ReorderItemsRequest;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json(
        createErrorResponse(400, '无效的请求数据', ErrorCode.INVALID_PARAMS)
      );
    }

    // 批量更新
    const now = BigInt(Date.now());
    const updatePromises = items.map((item) =>
      prisma.flashListItem.updateMany({
        where: { id: item.id, userId, deletedAt: null },
        data: {
          orderIndex: item.order,
          updatedAt: now,
        },
      })
    );

    await Promise.all(updatePromises);

    return res.status(200).json(
      createSuccessResponse({ updated: items.length }, '排序更新成功')
    );
  } catch (error) {
    console.error('Reorder items error:', error);
    return res.status(500).json(
      createErrorResponse(500, '更新排序失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}
