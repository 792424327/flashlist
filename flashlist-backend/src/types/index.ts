/**
 * FlashList 前后端共享类型定义
 *
 * 本文件定义了前后端通用的TypeScript类型
 * 可以在前端和Node.js后端项目中共享使用
 */

// ============ 枚举类型 ============

/**
 * 待办事项类型
 */
export type ItemType = 'task' | 'header';

/**
 * 缩进方向
 */
export type IndentDirection = 'in' | 'out';

// ============ 数据模型 ============

/**
 * 待办事项基础接口
 */
export interface FlashListItem {
  id: string;              // UUID，唯一标识符
  text: string;            // 任务或分类的文本内容
  completed: boolean;      // 完成状态（仅对task类型有效）
  level: number;           // 缩进级别，范围：0-4
  type: ItemType;          // 类型：任务或标题分类
  createdAt: number;       // 创建时间戳（毫秒）
  order?: number;          // 排序字段（后端使用）
}

/**
 * 用户接口
 */
export interface User {
  id: string;              // 用户UUID
  username: string;        // 用户名
  email: string;           // 邮箱
  avatarUrl?: string;      // 头像URL
  createdAt: number;       // 创建时间戳
  updatedAt: number;       // 更新时间戳
  lastLoginAt?: number;    // 最后登录时间戳
}

// ============ API 请求类型 ============

/**
 * 创建待办事项请求
 */
export interface CreateItemRequest {
  text?: string;           // 文本内容，默认为空字符串
  level?: number;          // 缩进级别，默认为0
  type?: ItemType;         // 类型，默认为'task'
  afterId?: string;        // 插入位置（在哪个item之后），不提供则添加到末尾
}

/**
 * 更新待办事项请求（部分更新）
 */
export interface UpdateItemRequest {
  text?: string;           // 更新文本
  completed?: boolean;     // 更新完成状态
  level?: number;          // 更新缩进级别
  type?: ItemType;         // 更新类型
}

/**
 * 批量更新排序请求
 */
export interface ReorderItemsRequest {
  items: Array<{
    id: string;            // 待办事项ID
    order: number;         // 新的排序值
  }>;
}

/**
 * 用户注册请求
 */
export interface RegisterRequest {
  username: string;        // 用户名
  email: string;           // 邮箱
  password: string;        // 密码（明文，后端会加密）
}

/**
 * 用户登录请求
 */
export interface LoginRequest {
  email: string;           // 邮箱
  password: string;        // 密码
}

// ============ API 响应类型 ============

/**
 * 通用API响应包装
 */
export interface ApiResponse<T = any> {
  code: number;            // 状态码（200成功，400客户端错误，500服务器错误）
  message: string;         // 响应消息
  data?: T;                // 响应数据
  error?: string;          // 错误代码（仅错误时存在）
}

/**
 * 获取所有待办事项响应
 */
export type GetItemsResponse = ApiResponse<FlashListItem[]>;

/**
 * 创建待办事项响应
 */
export type CreateItemResponse = ApiResponse<FlashListItem>;

/**
 * 更新待办事项响应
 */
export type UpdateItemResponse = ApiResponse<FlashListItem>;

/**
 * 删除待办事项响应
 */
export type DeleteItemResponse = ApiResponse<{ id: string }>;

/**
 * 批量更新排序响应
 */
export type ReorderItemsResponse = ApiResponse<{ updated: number }>;

/**
 * 用户登录响应数据
 */
export interface LoginResponseData {
  user: User;              // 用户信息
  token: string;           // 访问令牌
  refreshToken?: string;   // 刷新令牌
  expiresAt: number;       // 令牌过期时间戳
}

/**
 * 用户登录响应
 */
export type LoginResponse = ApiResponse<LoginResponseData>;

/**
 * 用户注册响应
 */
export type RegisterResponse = ApiResponse<User>;

// ============ 错误码枚举 ============

/**
 * API错误代码
 */
export enum ErrorCode {
  INVALID_PARAMS = 'INVALID_PARAMS',           // 请求参数无效
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',           // 待办事项不存在
  USER_NOT_FOUND = 'USER_NOT_FOUND',           // 用户不存在
  CONFLICT = 'CONFLICT',                       // 操作冲突
  UNAUTHORIZED = 'UNAUTHORIZED',               // 未授权
  FORBIDDEN = 'FORBIDDEN',                     // 禁止访问
  INTERNAL_ERROR = 'INTERNAL_ERROR',           // 服务器内部错误
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',         // 邮箱已存在
  DUPLICATE_USERNAME = 'DUPLICATE_USERNAME',   // 用户名已存在
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS', // 凭证无效
}

// ============ 常量 ============

/**
 * 缩进级别范围
 */
export const LEVEL_MIN = 0;
export const LEVEL_MAX = 4;

/**
 * API基础路径
 */
export const API_BASE_URL = '/api/v1';

// ============ 工具类型 ============

/**
 * 使类型的所有属性变为可选
 */
export type PartialFlashListItem = Partial<FlashListItem>;

/**
 * 仅包含更新字段的类型
 */
export type FlashListItemUpdate = UpdateItemRequest;

// ============ 类型守卫 ============

/**
 * 检查是否为有效的ItemType
 */
export function isValidItemType(type: any): type is ItemType {
  return type === 'task' || type === 'header';
}

/**
 * 检查是否为有效的缩进级别
 */
export function isValidLevel(level: any): level is number {
  return typeof level === 'number' && level >= LEVEL_MIN && level <= LEVEL_MAX;
}

/**
 * 检查是否为有效的FlashListItem
 */
export function isFlashListItem(obj: any): obj is FlashListItem {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.completed === 'boolean' &&
    isValidLevel(obj.level) &&
    isValidItemType(obj.type) &&
    typeof obj.createdAt === 'number'
  );
}

// ============ 默认值 ============

/**
 * 创建默认的API成功响应
 */
export function createSuccessResponse<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
  };
}

/**
 * 创建默认的API错误响应
 */
export function createErrorResponse(
  code: number,
  message: string,
  error: ErrorCode
): ApiResponse {
  return {
    code,
    message,
    error,
  };
}
