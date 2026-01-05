/**
 * 数据库种子文件 - 创建测试用户和初始数据
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建测试数据...');

  // 检查测试用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  if (existingUser) {
    console.log('⚠️  测试用户已存在，跳过创建');
    return;
  }

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    },
  });

  console.log('✅ 测试用户创建成功:');
  console.log('   邮箱: test@example.com');
  console.log('   密码: password123');

  // 为测试用户创建一些初始待办事项
  await prisma.flashListItem.createMany({
    data: [
      {
        userId: testUser.id,
        text: '欢迎使用 FlashList',
        completed: false,
        level: 0,
        type: 'header',
        orderIndex: 0,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
      {
        userId: testUser.id,
        text: '这是你的第一个任务',
        completed: false,
        level: 1,
        type: 'task',
        orderIndex: 1,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
      {
        userId: testUser.id,
        text: '按 Enter 键创建新任务',
        completed: false,
        level: 1,
        type: 'task',
        orderIndex: 2,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      },
    ],
  });

  console.log('✅ 初始待办事项创建成功');
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
