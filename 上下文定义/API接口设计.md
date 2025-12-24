# FlashList API 接口设计文档

## 概述

本文档定义了FlashList极简大纲清单应用的后端API接口规范。

**基础URL**: `/api/v1`

**认证方式**: Bearer Token（待实现）

---

## 数据模型

### FlashListItem

```typescript
interface FlashListItem {
  id: string;              // UUID，唯一标识符
  text: string;            // 任务或分类的文本内容
  completed: boolean;      // 完成状态（仅对task类型有效）
  level: number;           // 缩进级别，范围：0-4
  type: 'task' | 'header'; // 类型：任务或标题分类
  createdAt: number;       // 创建时间戳（毫秒）
  order: number;           // 排序字段，用于维持列表顺序
}
```

---

## API 接口列表

### 1. 获取所有待办事项

**接口**: `GET /items`

**描述**: 获取当前用户的所有待办事项列表，按order字段升序排序

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "工作",
      "completed": false,
      "level": 0,
      "type": "header",
      "createdAt": 1703001600000,
      "order": 0
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "完成项目文档",
      "completed": false,
      "level": 1,
      "type": "task",
      "createdAt": 1703001660000,
      "order": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "text": "代码审查",
      "completed": true,
      "level": 1,
      "type": "task",
      "createdAt": 1703001720000,
      "order": 2
    }
  ]
}
```

---

### 2. 创建待办事项

**接口**: `POST /items`

**描述**: 创建新的待办事项或分类

**请求体**:
```json
{
  "text": "新任务",
  "level": 1,
  "type": "task",
  "afterId": "550e8400-e29b-41d4-a716-446655440000"  // 可选，指定插入位置
}
```

**字段说明**:
- `text`: 可选，默认为空字符串
- `level`: 可选，默认为0
- `type`: 可选，默认为'task'
- `afterId`: 可选，指定在哪个item之后插入，不提供则添加到末尾

**响应示例**:
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "text": "新任务",
    "completed": false,
    "level": 1,
    "type": "task",
    "createdAt": 1703001780000,
    "order": 3
  }
}
```

---

### 3. 更新待办事项

**接口**: `PATCH /items/:id`

**描述**: 部分更新指定待办事项的信息

**URL参数**:
- `id`: 待办事项的UUID

**请求体** (所有字段可选):
```json
{
  "text": "更新后的文本",
  "completed": true,
  "level": 2,
  "type": "header"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "text": "更新后的文本",
    "completed": true,
    "level": 2,
    "type": "header",
    "createdAt": 1703001660000,
    "order": 1
  }
}
```

---

### 4. 删除待办事项

**接口**: `DELETE /items/:id`

**描述**: 删除指定的待办事项

**URL参数**:
- `id`: 待办事项的UUID

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**注意事项**:
- 如果是列表中的最后一项，则不允许删除（保持至少一项）
- 删除header类型的项时，不会级联删除其下的子任务

---

### 5. 批量更新排序

**接口**: `PUT /items/reorder`

**描述**: 批量更新待办事项的顺序（用于拖拽排序）

**请求体**:
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order": 0
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "order": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "order": 2
    }
  ]
}
```

**字段说明**:
- `items`: 包含id和新order值的数组
- 只需要传递顺序变化的项，不需要传递所有项

**响应示例**:
```json
{
  "code": 200,
  "message": "排序更新成功",
  "data": {
    "updated": 3
  }
}
```

---

## 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "code": 400,
  "message": "错误描述信息",
  "error": "ERROR_CODE"
}
```

### 常见错误码

| HTTP状态码 | 错误码 | 说明 |
|-----------|--------|------|
| 400 | INVALID_PARAMS | 请求参数无效 |
| 404 | ITEM_NOT_FOUND | 待办事项不存在 |
| 409 | CONFLICT | 操作冲突（如删除最后一项） |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

**示例**:
```json
{
  "code": 404,
  "message": "待办事项不存在",
  "error": "ITEM_NOT_FOUND"
}
```

---

## 业务逻辑说明

### 1. 缩进级别限制
- level范围：0-4（共5级）
- header类型缩进递减时，level不能小于0
- task类型缩进递增时，level不能大于4

### 2. 完成任务自动沉底
- 前端实现：当任务标记为完成时，在当前section内向下移动到底部
- section定义：从当前位置到下一个header之前，或列表末尾
- 后端不需要处理此逻辑，仅需支持order字段更新

### 3. 快捷指令处理
- `/h` 或 `/h ` 开头的文本会在前端转换为header类型
- 后端接收到的已经是处理后的数据

### 4. 排序规则
- 使用`order`字段维护顺序，值越小排序越靠前
- 创建新item时：
  - 如果指定afterId，order = afterItem.order + 0.5
  - 如果未指定，order = maxOrder + 1
- 拖拽重排时，批量更新order为连续整数

---

## 前端集成说明

### localStorage迁移策略

当前前端使用localStorage存储数据，迁移到API时建议：

1. **初次加载**：
   - 先调用 `GET /items` 获取服务器数据
   - 如果服务器返回空列表，检查localStorage
   - 如果localStorage有数据，批量上传到服务器

2. **数据同步**：
   - 所有修改操作立即调用API
   - API成功后更新本地状态
   - 失败时保持本地状态不变，显示错误提示

3. **离线支持（可选）**：
   - 使用Service Worker缓存API请求
   - 离线时写入localStorage队列
   - 恢复在线后同步到服务器

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-12-23 | 初始版本 |
