/**
 * 认证控制器
 */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/db.js';
import { hashPassword, verifyPassword, generateToken, getTokenExpiry, sanitizeUser } from '../utils/auth.js';
import { createSuccessResponse, createErrorResponse, ErrorCode, RegisterRequest, LoginRequest } from '../types/index.js';

/**
 * 用户注册
 */
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body as RegisterRequest;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json(
        createErrorResponse(400, '用户名、邮箱和密码不能为空', ErrorCode.INVALID_PARAMS)
      );
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(409).json(
        createErrorResponse(409, '用户名已存在', ErrorCode.DUPLICATE_USERNAME)
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json(
        createErrorResponse(409, '邮箱已存在', ErrorCode.DUPLICATE_EMAIL)
      );
    }

    // 创建用户
    const passwordHash = await hashPassword(password);
    const now = BigInt(Date.now());

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    });

    return res.status(201).json(
      createSuccessResponse(sanitizeUser(user), '注册成功')
    );
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json(
      createErrorResponse(500, '注册失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 用户登录
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginRequest;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json(
        createErrorResponse(400, '邮箱和密码不能为空', ErrorCode.INVALID_PARAMS)
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json(
        createErrorResponse(401, '邮箱或密码错误', ErrorCode.INVALID_CREDENTIALS)
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json(
        createErrorResponse(401, '邮箱或密码错误', ErrorCode.INVALID_CREDENTIALS)
      );
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
    });

    // 生成Token
    const token = generateToken(user.id);
    const expiresAt = getTokenExpiry();

    return res.status(200).json(
      createSuccessResponse({
        user: sanitizeUser(user),
        token,
        expiresAt,
      }, '登录成功')
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(
      createErrorResponse(500, '登录失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}

/**
 * 获取当前用户信息
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        createErrorResponse(401, '未授权', ErrorCode.UNAUTHORIZED)
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(
        createErrorResponse(404, '用户不存在', ErrorCode.USER_NOT_FOUND)
      );
    }

    return res.status(200).json(
      createSuccessResponse(sanitizeUser(user), '获取成功')
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json(
      createErrorResponse(500, '获取用户信息失败', ErrorCode.INTERNAL_ERROR)
    );
  }
}
