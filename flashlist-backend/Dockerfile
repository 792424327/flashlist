# 后端 Dockerfile
FROM node:20-alpine AS builder

# 安装 OpenSSL 和其他必要的依赖
RUN apk add --no-cache openssl libc6-compat

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript 代码
RUN npm run build

# 生产阶段
FROM node:20-alpine

# 安装运行时需要的 OpenSSL
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 只安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 从 builder 阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 创建数据库目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
