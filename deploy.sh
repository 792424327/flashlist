#!/bin/bash

# FlashList 快速部署脚本
# 使用方法: bash deploy.sh

set -e

echo "========================================="
echo "   FlashList Docker 部署脚本"
echo "========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在从模板创建..."
    cp .env.example .env

    # 生成随机 JWT_SECRET
    if command -v node &> /dev/null; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
        echo "✅ 已自动生成 JWT_SECRET"
    else
        echo "⚠️  请手动编辑 .env 文件，设置 JWT_SECRET"
    fi

    echo "📝 请编辑 .env 文件，配置必要的环境变量"
    echo "   nano .env"
    read -p "配置完成后按 Enter 继续..."
fi

echo ""
echo "开始部署..."
echo ""

# 停止现有服务
echo "🛑 停止现有服务..."
docker compose down 2>/dev/null || true

# 构建镜像
echo ""
echo "🔨 构建 Docker 镜像..."
docker compose build

# 启动服务
echo ""
echo "🚀 启动服务..."
docker compose up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
docker compose ps

# 健康检查
echo ""
echo "🏥 健康检查..."

if curl -f http://localhost:3001/health &>/dev/null; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务异常"
    echo "请查看日志: docker compose logs backend"
fi

if curl -f http://localhost/health &>/dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
    echo "请查看日志: docker compose logs frontend"
fi

echo ""
echo "========================================="
echo "   部署完成！"
echo "========================================="
echo ""
echo "🌐 前端地址: http://localhost"
echo "🔧 后端API: http://localhost:3001"
echo ""
echo "📋 常用命令:"
echo "  查看日志: docker compose logs -f"
echo "  停止服务: docker compose down"
echo "  重启服务: docker compose restart"
echo ""
echo "📖 详细文档请查看: 部署指南.md"
echo ""
