/**
 * Prisma客户端实例
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * 优雅关闭数据库连接
 */
export async function disconnectDB() {
  await prisma.$disconnect();
}

// 处理进程退出时断开连接
process.on('beforeExit', async () => {
  await disconnectDB();
});
