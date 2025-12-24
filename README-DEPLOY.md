# FlashList 快速部署

## 🚀 一键部署（推荐）

### Linux/Mac 用户

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### Windows 用户

```bash
# 使用 Git Bash 或 WSL
bash deploy.sh

# 或者手动执行以下命令
docker compose build
docker compose up -d
```

## 📝 手动部署步骤

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（重要！）
# Windows: notepad .env
# Linux/Mac: nano .env
```

**必须修改的配置**：
- `JWT_SECRET`: 设置为安全的随机字符串
- `CORS_ORIGIN`: 生产环境改为实际域名

### 2. 启动服务

```bash
# 构建镜像
docker compose build

# 启动服务（后台运行）
docker compose up -d

# 查看日志
docker compose logs -f
```

### 3. 访问应用

- **前端**: http://localhost
- **后端API**: http://localhost:3001

## 📂 项目结构

```
代办事项web/
├── flashlist-backend/          # 后端服务
│   ├── Dockerfile              # 后端 Docker 配置
│   ├── .dockerignore
│   └── ...
├── flashlist---极简大纲清单_前端/  # 前端服务
│   ├── Dockerfile              # 前端 Docker 配置
│   ├── nginx.conf              # Nginx 配置
│   ├── .dockerignore
│   └── ...
├── docker-compose.yml          # Docker Compose 配置
├── .env.example                # 环境变量模板
├── deploy.sh                   # 一键部署脚本
├── 部署指南.md                  # 详细部署文档
└── README-DEPLOY.md            # 本文件
```

## ⚙️ 配置说明

### Docker Compose 服务

- **backend**: Express + Prisma 后端服务（端口 3001）
- **frontend**: React + Nginx 前端服务（端口 80）

### 环境变量

| 变量名 | 说明 | 默认值 | 是否必须 |
|--------|------|--------|----------|
| JWT_SECRET | JWT 加密密钥 | - | ✅ 是 |
| CORS_ORIGIN | 允许的跨域来源 | http://localhost | ✅ 是 |
| GEMINI_API_KEY | Gemini API 密钥 | - | ❌ 可选 |

### 数据持久化

数据存储在 `./data/` 目录下：
- SQLite 数据库文件
- 用户上传的文件（如果有）

**备份数据**：
```bash
# 备份整个 data 目录
cp -r data backups/data-$(date +%Y%m%d)
```

## 🔧 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 只查看后端日志
docker compose logs -f backend

# 只查看前端日志
docker compose logs -f frontend

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 停止并删除数据
docker compose down -v

# 更新服务
docker compose pull
docker compose up -d --build
```

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细错误信息
docker compose logs

# 检查端口占用
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :80
lsof -i :3001
```

### 数据库错误

```bash
# 重新初始化数据库
docker compose exec backend npx prisma db push

# 或者删除数据重新开始
docker compose down -v
docker compose up -d
```

### 前端无法连接后端

1. 检查后端服务是否正常: `curl http://localhost:3001/health`
2. 检查 Nginx 配置: `docker compose exec frontend cat /etc/nginx/conf.d/default.conf`
3. 查看浏览器控制台的错误信息

## 🌐 生产环境部署

### 使用 HTTPS

1. 获取 SSL 证书（Let's Encrypt）
2. 修改 `nginx.conf` 添加 SSL 配置
3. 在 `docker-compose.yml` 中挂载证书

详细步骤请查看 **部署指南.md** 中的 "HTTPS 配置" 章节。

### 使用 PostgreSQL

生产环境建议使用 PostgreSQL 替代 SQLite：

```yaml
# 在 docker-compose.yml 中添加
services:
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=flashlist
      - POSTGRES_USER=flashlist
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

详细配置请查看 **部署指南.md**。

## 📚 更多文档

- **部署指南.md**: 完整的生产环境部署指南
- **快速开始.md**: 开发环境设置和功能说明
- **上下文定义/**: API 文档和技术规范

## 🆘 获取帮助

遇到问题？
1. 查看 `部署指南.md` 中的故障排查章节
2. 检查 Docker 日志: `docker compose logs`
3. 在项目 GitHub Issues 提交问题

---

**祝部署顺利！** 🎉
