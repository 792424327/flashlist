/**
 * 错误处理中间件
 */
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, ErrorCode } from '../types/index.js';

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Prisma错误处理
  if (err.code === 'P2002') {
    return res.status(409).json(
      createErrorResponse(409, '数据已存在', ErrorCode.CONFLICT)
    );
  }

  if (err.code === 'P2025') {
    return res.status(404).json(
      createErrorResponse(404, '数据不存在', ErrorCode.ITEM_NOT_FOUND)
    );
  }

  // 默认错误
  return res.status(500).json(
    createErrorResponse(500, err.message || '服务器内部错误', ErrorCode.INTERNAL_ERROR)
  );
}

/**
 * 404处理中间件
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(
    createErrorResponse(404, '接口不存在', ErrorCode.ITEM_NOT_FOUND)
  );
}
