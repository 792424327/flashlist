# FlashList Backend API

FlashList 极简大纲清单应用的后端API服务。

## 技术栈

- **Node.js** - 运行时环境
- **Express** - Web框架
- **TypeScript** - 类型安全
- **Prisma** - ORM数据库工具
- **SQLite** - 数据库（开发环境）
- **JWT** - 身份认证
- **bcrypt** - 密码加密

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`，或直接使用已有的 `.env` 文件。

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### 3. 初始化数据库

```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库schema（开发环境）
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

## 可用脚本

```bash
npm run dev         # 启动开发服务器（热重载）
npm run build       # 编译TypeScript到JavaScript
npm start           # 启动生产服务器
npm run db:push     # 推送数据库schema（无迁移文件）
npm run db:migrate  # 创建并应用迁移
npm run db:studio   # 打开Prisma Studio（数据库GUI）
npm run db:generate # 生成Prisma客户端
```

## API端点

### 认证相关

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 | ❌ |
| POST | `/api/v1/auth/login` | 用户登录 | ❌ |
| GET  | `/api/v1/auth/profile` | 获取用户信息 | ✅ |

### 待办事项相关

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET    | `/api/v1/items` | 获取所有待办事项 | ✅ |
| POST   | `/api/v1/items` | 创建待办事项 | ✅ |
| PATCH  | `/api/v1/items/:id` | 更新待办事项 | ✅ |
| DELETE | `/api/v1/items/:id` | 删除待办事项 | ✅ |
| PUT    | `/api/v1/items/reorder` | 批量更新排序 | ✅ |

### 健康检查

| 方法 | 端点 | 描述 |
|------|------|------|
| GET  | `/health` | 服务器健康检查 |

## 请求示例

### 用户注册

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "email": "demo@example.com",
    "password": "password123"
  }'
```

### 用户登录

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }'
```

### 获取待办事项

```bash
curl -X GET http://localhost:3001/api/v1/items \
  -H "Authorization: Bearer <your-token>"
```

### 创建待办事项

```bash
curl -X POST http://localhost:3001/api/v1/items \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "新任务",
    "level": 1,
    "type": "task"
  }'
```

## 项目结构

```
flashlist-backend/
├── prisma/
│   └── schema.prisma       # 数据库模型定义
├── src/
│   ├── controllers/        # 控制器（业务逻辑）
│   │   ├── authController.ts
│   │   └── itemsController.ts
│   ├── middleware/         # 中间件
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/             # 路由定义
│   │   ├── authRoutes.ts
│   │   └── itemsRoutes.ts
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── auth.ts
│   │   └── db.ts
│   └── index.ts            # 应用入口
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目说明
```

## 数据库

### SQLite（开发环境）

默认使用SQLite，无需额外安装。数据库文件保存在 `prisma/dev.db`。

### PostgreSQL（生产环境）

修改 `.env` 中的 `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/flashlist?schema=public"
```

然后更新 `prisma/schema.prisma` 中的 `provider`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

运行迁移：

```bash
npm run db:migrate
```

## 数据库管理

### Prisma Studio

打开可视化数据库管理界面：

```bash
npm run db:studio
```

访问 `http://localhost:5555` 查看和编辑数据。

### 查看数据库

```bash
# SQLite
sqlite3 prisma/dev.db
.tables
SELECT * FROM users;
```

## 部署

### 使用Docker（推荐）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm run db:generate
EXPOSE 3001
CMD ["npm", "start"]
```

### 云平台部署

支持部署到：
- **Railway** - 自动检测Node.js项目
- **Vercel** - 配合Serverless Functions
- **Heroku** - 使用Procfile
- **DigitalOcean App Platform**

## 安全建议

1. **更改JWT密钥** - 生产环境务必使用强密码
2. **使用HTTPS** - 生产环境启用SSL
3. **限流保护** - 防止暴力攻击
4. **输入验证** - 已集成基础验证，可扩展
5. **定期更新依赖** - 保持依赖包最新

## 常见问题

### 数据库连接失败

检查 `.env` 中的 `DATABASE_URL` 是否正确。

### Token无效

确保请求头中包含有效的 `Authorization: Bearer <token>`。

### CORS错误

检查 `.env` 中的 `CORS_ORIGIN` 是否与前端地址匹配。

## 开发指南

详细的API文档和开发指南请查看项目根目录下的 `上下文定义/` 文件夹：

- `API接口设计.md` - 完整的API规范
- `数据库设计.md` - 数据库表结构
- `HTTP请求示例.md` - API调用示例

## License

MIT
