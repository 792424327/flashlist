# FlashList 上下文定义文档

本目录包含了FlashList极简大纲清单应用的完整API接口规范、数据库设计和开发指南。

---

## 📁 文件说明

### 1. API接口设计.md

**用途**: 定义了完整的RESTful API接口规范

**包含内容**:
- API接口列表（获取、创建、更新、删除、批量排序）
- 请求/响应格式
- 数据模型定义
- 错误响应格式
- 业务逻辑说明
- 前端集成指南

**适用对象**:
- 后端开发人员：实现API接口
- 前端开发人员：调用API接口
- 测试人员：编写接口测试用例

---

### 2. 数据库设计.md

**用途**: 定义了数据库表结构和优化策略

**包含内容**:
- 表结构设计（users、flash_list_items、sessions）
- 索引策略
- 数据约束
- 初始数据
- 性能优化建议
- 备份策略
- MySQL和PostgreSQL版本

**适用对象**:
- 后端开发人员：创建数据库表
- DBA：优化数据库性能
- 运维人员：配置备份策略

---

### 3. types.ts

**用途**: TypeScript类型定义文件，前后端共享

**包含内容**:
- 数据模型接口（FlashListItem、User等）
- API请求/响应类型
- 错误码枚举
- 工具类型和类型守卫
- API端点常量
- 默认值生成函数

**适用对象**:
- 前端开发人员：导入使用类型定义
- 后端开发人员（Node.js/TypeScript）：导入使用类型定义

**使用方法**:
```typescript
// 前端项目
import { FlashListItem, CreateItemRequest, API_ENDPOINTS } from './types';

// 后端项目
import { FlashListItem, ApiResponse } from '../shared/types';
```

---

### 4. HTTP请求示例.md

**用途**: 提供API调用的实战示例

**包含内容**:
- curl命令示例
- JavaScript fetch示例
- axios示例
- 完整的API客户端封装
- 错误处理最佳实践
- Postman集合

**适用对象**:
- 前端开发人员：参考实现API调用
- 测试人员：使用curl或Postman测试接口
- API文档阅读者：理解接口使用方法

---

## 🚀 快速开始

### 后端开发流程

1. **阅读API接口设计.md**，了解所有接口规范
2. **阅读数据库设计.md**，创建数据库表
3. **复制types.ts**到项目中作为类型定义
4. **参考HTTP请求示例.md**，测试已实现的接口

### 前端开发流程

1. **阅读API接口设计.md**，了解接口请求/响应格式
2. **复制types.ts**到项目中
3. **参考HTTP请求示例.md**，实现API调用逻辑
4. **使用axios封装示例**，创建统一的API客户端

---

## 📋 开发检查清单

### 后端实现检查

- [ ] 创建数据库表（users、flash_list_items）
- [ ] 实现用户认证（注册、登录、token验证）
- [ ] 实现 GET /items 接口
- [ ] 实现 POST /items 接口
- [ ] 实现 PATCH /items/:id 接口
- [ ] 实现 DELETE /items/:id 接口
- [ ] 实现 PUT /items/reorder 接口
- [ ] 添加请求参数验证
- [ ] 添加错误处理中间件
- [ ] 配置CORS
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 配置数据库备份

### 前端集成检查

- [ ] 导入types.ts类型定义
- [ ] 创建API客户端（axios或fetch）
- [ ] 实现登录功能
- [ ] 实现token存储和自动附加
- [ ] 实现获取列表功能
- [ ] 实现创建item功能
- [ ] 实现更新item功能
- [ ] 实现删除item功能
- [ ] 实现拖拽排序后的批量更新
- [ ] 添加错误处理和用户提示
- [ ] 实现localStorage到API的迁移逻辑
- [ ] 测试所有功能

---

## 🛠️ 技术栈建议

### 后端推荐

**Node.js方案**:
- **框架**: Express / Fastify / Koa
- **数据库ORM**: Prisma / TypeORM / Sequelize
- **认证**: jsonwebtoken + bcrypt
- **验证**: Zod / Joi / Yup
- **日志**: Winston / Pino

**其他语言方案**:
- **Go**: Gin + GORM
- **Python**: FastAPI / Django REST Framework
- **Java**: Spring Boot

### 数据库选择

- **开发/小型项目**: SQLite / MySQL
- **生产环境**: PostgreSQL / MySQL 8.0+
- **云服务**: AWS RDS / Google Cloud SQL / Azure Database

---

## 📊 数据流程图

```
┌─────────────┐         HTTP请求          ┌─────────────┐
│             │ ──────────────────────▶   │             │
│   前端应用   │                           │  后端API    │
│  (React)    │ ◀──────────────────────   │  (Express)  │
│             │         JSON响应          │             │
└─────────────┘                           └──────┬──────┘
                                                  │
                                                  │ SQL查询
                                                  │
                                           ┌──────▼──────┐
                                           │             │
                                           │   数据库    │
                                           │  (MySQL)    │
                                           │             │
                                           └─────────────┘
```

---

## 🔄 API调用流程示例

### 用户创建新任务的完整流程

```
1. 用户在前端输入任务文本并按Enter
   ↓
2. 前端调用 POST /items 接口
   请求体: { text: "新任务", level: 1, type: "task" }
   请求头: Authorization: Bearer <token>
   ↓
3. 后端验证token，确认用户身份
   ↓
4. 后端生成UUID和时间戳
   ↓
5. 后端计算order值（afterId指定位置或末尾）
   ↓
6. 后端插入数据库
   INSERT INTO flash_list_items (id, user_id, text, ...)
   ↓
7. 后端返回创建的item数据
   响应: { code: 201, data: { id: "...", text: "新任务", ... } }
   ↓
8. 前端接收响应，更新本地state
   ↓
9. 前端UI自动刷新，显示新任务
```

---

## 🔐 安全注意事项

### 必须实现的安全措施

1. **密码安全**
   - 使用bcrypt哈希密码，不存储明文
   - 最小密码长度：8位
   - 建议使用密码强度验证

2. **Token安全**
   - 使用JWT签名
   - 设置合理的过期时间（如7天）
   - 实现刷新token机制

3. **输入验证**
   - 验证所有用户输入
   - text字段长度限制（如最大1000字符）
   - level范围检查（0-4）
   - type枚举检查

4. **SQL注入防护**
   - 使用参数化查询或ORM
   - 永远不要拼接SQL字符串

5. **XSS防护**
   - 前端渲染时转义HTML
   - 后端返回时清理危险字符

6. **CSRF防护**
   - 使用CSRF token
   - 验证Origin和Referer头

7. **速率限制**
   - 限制API请求频率（如每分钟60次）
   - 登录失败次数限制

---

## 🧪 测试建议

### 后端API测试

```javascript
// 使用Jest + Supertest示例
describe('FlashList API', () => {
  test('GET /items 应返回用户的所有待办事项', async () => {
    const response = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /items 应创建新待办事项', async () => {
    const newItem = {
      text: '测试任务',
      level: 1,
      type: 'task',
    };

    const response = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send(newItem)
      .expect(201);

    expect(response.body.data.text).toBe('测试任务');
    expect(response.body.data.id).toBeDefined();
  });
});
```

### 前端集成测试

```javascript
// 使用React Testing Library示例
test('创建新任务', async () => {
  render(<App />);

  const input = screen.getByPlaceholderText('输入任务...');
  fireEvent.change(input, { target: { value: '新任务' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText('新任务')).toBeInTheDocument();
  });
});
```

---

## 📈 性能优化建议

### 后端优化

1. **数据库查询优化**
   - 为user_id和order_index添加复合索引
   - 使用EXPLAIN分析慢查询

2. **缓存策略**
   - 使用Redis缓存用户的items列表
   - 缓存时间：5分钟
   - 修改时清除缓存

3. **批量操作优化**
   - reorder接口使用事务和批量UPDATE
   - 避免N+1查询问题

### 前端优化

1. **减少API调用**
   - 本地状态优先更新
   - 防抖拖拽操作

2. **虚拟列表**
   - 当items超过100时使用虚拟滚动

3. **乐观更新**
   - 先更新UI，后调用API
   - 失败时回滚

---

## 📞 联系与支持

如有疑问或需要帮助，请联系开发团队。

---

## 📄 许可证

本文档仅供FlashList项目内部使用。

---

## 📝 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-12-23 | 初始版本，包含所有核心文档 |

---

## 🎯 下一步计划

- [ ] 添加WebSocket支持（实时协作）
- [ ] 实现标签功能
- [ ] 实现子任务关系
- [ ] 添加截止日期功能
- [ ] 实现数据导出（JSON/CSV）
- [ ] 移动端适配
- [ ] 离线支持（PWA）
