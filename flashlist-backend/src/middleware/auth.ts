/**
 * 认证中间件
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { createErrorResponse, ErrorCode } from '../types/index.js';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * JWT认证中间件
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        createErrorResponse(401, '未提供认证令牌', ErrorCode.UNAUTHORIZED)
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json(
        createErrorResponse(401, '无效的认证令牌', ErrorCode.UNAUTHORIZED)
      );
    }
  } catch (error) {
    return res.status(500).json(
      createErrorResponse(500, '认证失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}
