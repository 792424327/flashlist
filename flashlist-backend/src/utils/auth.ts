/**
 * 认证工具函数
 */
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../types/index.js';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 生成JWT Token
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证JWT Token
 */
export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 计算token过期时间
 */
export function getTokenExpiry(): number {
  const expiresIn = String(JWT_EXPIRES_IN);
  const days = parseInt(expiresIn) || 7;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

/**
 * 从User数据库模型转换为API响应用户对象
 */
export function sanitizeUser(user: any): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
    createdAt: Number(user.createdAt),
    updatedAt: Number(user.updatedAt),
    lastLoginAt: user.lastLoginAt ? Number(user.lastLoginAt) : undefined,
  };
}
