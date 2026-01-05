#!/bin/bash

# 在服务器容器中创建测试账户的脚本

echo "🔧 正在服务器容器中创建测试账户..."
echo ""

# 检查容器是否运行
if ! docker compose ps | grep -q "flashlist-backend.*running"; then
    echo "❌ 错误: 后端容器未运行"
    echo "请先启动服务: docker compose up -d"
    exit 1
fi

# 在容器中运行 seed 脚本
echo "📝 运行数据库 seed 脚本..."
docker compose exec backend npx tsx prisma/seed.ts

echo ""
echo "✅ 完成！"
echo ""
echo "测试账户信息:"
echo "  邮箱: test@example.com"
echo "  密码: password123"
echo ""
echo "现在可以使用这个账户登录了！"
