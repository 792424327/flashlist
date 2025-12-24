# FlashList HTTP 请求示例

本文档提供了FlashList API的HTTP请求示例，包括curl命令、JavaScript fetch示例和axios示例。

---

## 前置说明

**基础URL**: `http://localhost:3000/api/v1`（开发环境）

**认证方式**: 在请求头中携带 `Authorization: Bearer <token>`

---

## 1. 获取所有待办事项

### curl 示例

```bash
curl -X GET "http://localhost:3000/api/v1/items" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

### fetch 示例

```javascript
async function getItems() {
  const response = await fetch('http://localhost:3000/api/v1/items', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (result.code === 200) {
    console.log('待办事项列表:', result.data);
    return result.data;
  } else {
    console.error('获取失败:', result.message);
    throw new Error(result.message);
  }
}
```

### axios 示例

```javascript
import axios from 'axios';

async function getItems() {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/items', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('待办事项列表:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('获取失败:', error.response?.data?.message);
    throw error;
  }
}
```

---

## 2. 创建待办事项

### curl 示例

```bash
# 创建普通任务
curl -X POST "http://localhost:3000/api/v1/items" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "新任务",
    "level": 1,
    "type": "task",
    "afterId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# 创建分类标题
curl -X POST "http://localhost:3000/api/v1/items" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "新分类",
    "level": 0,
    "type": "header"
  }'
```

### fetch 示例

```javascript
async function createItem(itemData) {
  const response = await fetch('http://localhost:3000/api/v1/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: itemData.text || '',
      level: itemData.level || 0,
      type: itemData.type || 'task',
      afterId: itemData.afterId, // 可选
    }),
  });

  const result = await response.json();

  if (result.code === 201) {
    console.log('创建成功:', result.data);
    return result.data;
  } else {
    console.error('创建失败:', result.message);
    throw new Error(result.message);
  }
}

// 使用示例
createItem({
  text: '买牛奶',
  level: 1,
  type: 'task',
  afterId: 'some-item-id',
});
```

### axios 示例

```javascript
async function createItem(itemData) {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/items',
      {
        text: itemData.text || '',
        level: itemData.level || 0,
        type: itemData.type || 'task',
        afterId: itemData.afterId,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('创建成功:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('创建失败:', error.response?.data?.message);
    throw error;
  }
}
```

---

## 3. 更新待办事项

### curl 示例

```bash
# 更新文本内容
curl -X PATCH "http://localhost:3000/api/v1/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "更新后的文本"
  }'

# 标记为完成
curl -X PATCH "http://localhost:3000/api/v1/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'

# 调整缩进级别
curl -X PATCH "http://localhost:3000/api/v1/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 2
  }'

# 转换为标题
curl -X PATCH "http://localhost:3000/api/v1/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "header"
  }'
```

### fetch 示例

```javascript
async function updateItem(id, updates) {
  const response = await fetch(`http://localhost:3000/api/v1/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (result.code === 200) {
    console.log('更新成功:', result.data);
    return result.data;
  } else {
    console.error('更新失败:', result.message);
    throw new Error(result.message);
  }
}

// 使用示例
updateItem('550e8400-e29b-41d4-a716-446655440001', {
  text: '完成项目文档（已更新）',
  completed: true,
});
```

### axios 示例

```javascript
async function updateItem(id, updates) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/api/v1/items/${id}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('更新成功:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('更新失败:', error.response?.data?.message);
    throw error;
  }
}
```

---

## 4. 删除待办事项

### curl 示例

```bash
curl -X DELETE "http://localhost:3000/api/v1/items/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

### fetch 示例

```javascript
async function deleteItem(id) {
  const response = await fetch(`http://localhost:3000/api/v1/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (result.code === 200) {
    console.log('删除成功:', result.data);
    return result.data;
  } else {
    console.error('删除失败:', result.message);
    throw new Error(result.message);
  }
}

// 使用示例
deleteItem('550e8400-e29b-41d4-a716-446655440001');
```

### axios 示例

```javascript
async function deleteItem(id) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/v1/items/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('删除成功:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('删除失败:', error.response?.data?.message);
    throw error;
  }
}
```

---

## 5. 批量更新排序

### curl 示例

```bash
curl -X PUT "http://localhost:3000/api/v1/items/reorder" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### fetch 示例

```javascript
async function reorderItems(itemsOrder) {
  const response = await fetch('http://localhost:3000/api/v1/items/reorder', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: itemsOrder.map((item, index) => ({
        id: item.id,
        order: index,
      })),
    }),
  });

  const result = await response.json();

  if (result.code === 200) {
    console.log('排序更新成功，共更新', result.data.updated, '项');
    return result.data;
  } else {
    console.error('排序更新失败:', result.message);
    throw new Error(result.message);
  }
}

// 使用示例：拖拽后的新顺序
const newOrder = [
  { id: 'item-1' },
  { id: 'item-3' },
  { id: 'item-2' },
];
reorderItems(newOrder);
```

### axios 示例

```javascript
async function reorderItems(itemsOrder) {
  try {
    const response = await axios.put(
      'http://localhost:3000/api/v1/items/reorder',
      {
        items: itemsOrder.map((item, index) => ({
          id: item.id,
          order: index,
        })),
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('排序更新成功:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('排序更新失败:', error.response?.data?.message);
    throw error;
  }
}
```

---

## 6. 用户认证相关

### 用户注册

```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "securePassword123"
  }'
```

```javascript
async function register(username, email, password) {
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const result = await response.json();

  if (result.code === 201) {
    console.log('注册成功:', result.data);
    return result.data;
  } else {
    console.error('注册失败:', result.message);
    throw new Error(result.message);
  }
}
```

### 用户登录

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "securePassword123"
  }'
```

```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (result.code === 200) {
    console.log('登录成功:', result.data);
    // 保存token
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    return result.data;
  } else {
    console.error('登录失败:', result.message);
    throw new Error(result.message);
  }
}
```

---

## 完整的API客户端封装示例

### 使用 axios

```javascript
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期，跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API方法封装
export const flashListAPI = {
  // 待办事项相关
  items: {
    getAll: () => apiClient.get('/items'),
    create: (data) => apiClient.post('/items', data),
    update: (id, data) => apiClient.patch(`/items/${id}`, data),
    delete: (id) => apiClient.delete(`/items/${id}`),
    reorder: (items) => apiClient.put('/items/reorder', { items }),
  },

  // 认证相关
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
  },

  // 用户相关
  user: {
    getProfile: () => apiClient.get('/users/profile'),
  },
};

// 使用示例
async function example() {
  try {
    // 登录
    const loginResult = await flashListAPI.auth.login({
      email: 'demo@example.com',
      password: 'password123',
    });
    console.log('登录成功:', loginResult.data);

    // 获取列表
    const itemsResult = await flashListAPI.items.getAll();
    console.log('待办事项:', itemsResult.data);

    // 创建新任务
    const newItemResult = await flashListAPI.items.create({
      text: '新任务',
      level: 1,
      type: 'task',
    });
    console.log('创建成功:', newItemResult.data);

    // 更新任务
    const updateResult = await flashListAPI.items.update(newItemResult.data.id, {
      completed: true,
    });
    console.log('更新成功:', updateResult.data);

    // 删除任务
    const deleteResult = await flashListAPI.items.delete(newItemResult.data.id);
    console.log('删除成功:', deleteResult.data);
  } catch (error) {
    console.error('操作失败:', error);
  }
}
```

---

## 错误处理最佳实践

```javascript
// 统一错误处理函数
function handleApiError(error) {
  if (error.response) {
    // 服务器返回错误响应
    const { code, message, error: errorCode } = error.response.data;

    switch (errorCode) {
      case 'UNAUTHORIZED':
        alert('请先登录');
        window.location.href = '/login';
        break;
      case 'ITEM_NOT_FOUND':
        alert('该项目不存在');
        break;
      case 'INVALID_PARAMS':
        alert('参数错误，请检查输入');
        break;
      default:
        alert(`操作失败: ${message}`);
    }
  } else if (error.request) {
    // 请求已发送但未收到响应
    alert('网络连接失败，请检查网络');
  } else {
    // 其他错误
    alert('操作失败，请稍后重试');
  }
}

// 使用示例
async function createItemSafe(itemData) {
  try {
    return await flashListAPI.items.create(itemData);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
```

---

## Postman 集合

可以将以下JSON导入Postman进行测试：

```json
{
  "info": {
    "name": "FlashList API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "获取所有待办事项",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/items",
          "host": ["{{baseUrl}}"],
          "path": ["items"]
        }
      }
    },
    {
      "name": "创建待办事项",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"text\": \"新任务\",\n  \"level\": 1,\n  \"type\": \"task\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/items",
          "host": ["{{baseUrl}}"],
          "path": ["items"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "token",
      "value": "your-token-here"
    }
  ]
}
```

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-12-23 | 初始版本，包含所有核心API请求示例 |
