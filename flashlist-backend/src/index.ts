/**
 * FlashList Backend API
 * 主应用入口文件
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { prisma } from './utils/db.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// 中间件
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    env: process.env.NODE_ENV,
  });
});

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/items', itemsRoutes);

// 用户路由（别名）
app.use('/api/v1/users', authRoutes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    app.listen(PORT, () => {
      console.log(`🚀 服务器启动成功！`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 CORS允许来源: ${CORS_ORIGIN}`);
      console.log('\n可用的API端点:');
      console.log(`  POST   /api/v1/auth/register    - 用户注册`);
      console.log(`  POST   /api/v1/auth/login       - 用户登录`);
      console.log(`  GET    /api/v1/auth/profile     - 获取用户信息`);
      console.log(`  GET    /api/v1/items            - 获取所有待办事项`);
      console.log(`  POST   /api/v1/items            - 创建待办事项`);
      console.log(`  PATCH  /api/v1/items/:id        - 更新待办事项`);
      console.log(`  DELETE /api/v1/items/:id        - 删除待办事项`);
      console.log(`  PUT    /api/v1/items/reorder    - 批量更新排序`);
      console.log(`  GET    /health                  - 健康检查\n`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
