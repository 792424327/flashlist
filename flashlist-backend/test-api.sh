#!/bin/bash
# FlashList API 测试脚本

BASE_URL="http://localhost:3001"

echo "========================================="
echo "FlashList API 测试脚本"
echo "========================================="
echo ""

# 1. 健康检查
echo "1. 测试健康检查接口..."
curl -s "${BASE_URL}/health" | jq
echo -e "\n"

# 2. 用户注册
echo "2. 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"password123"}')
echo $REGISTER_RESPONSE | jq
echo -e "\n"

# 3. 用户登录
echo "3. 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}')
echo $LOGIN_RESPONSE | jq

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "获取到Token: $TOKEN"
echo -e "\n"

# 4. 获取用户信息
echo "4. 测试获取用户信息..."
curl -s -X GET "${BASE_URL}/api/v1/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

# 5. 创建待办事项
echo "5. 测试创建待办事项..."
CREATE_ITEM1=$(curl -s -X POST "${BASE_URL}/api/v1/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"工作","level":0,"type":"header"}')
echo $CREATE_ITEM1 | jq

CREATE_ITEM2=$(curl -s -X POST "${BASE_URL}/api/v1/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"完成项目文档","level":1,"type":"task"}')
echo $CREATE_ITEM2 | jq

ITEM_ID=$(echo $CREATE_ITEM2 | jq -r '.data.id')
echo -e "\n"

# 6. 获取所有待办事项
echo "6. 测试获取所有待办事项..."
curl -s -X GET "${BASE_URL}/api/v1/items" \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

# 7. 更新待办事项
echo "7. 测试更新待办事项..."
curl -s -X PATCH "${BASE_URL}/api/v1/items/${ITEM_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | jq
echo -e "\n"

# 8. 批量更新排序
echo "8. 测试批量更新排序..."
curl -s -X PUT "${BASE_URL}/api/v1/items/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"'${ITEM_ID}'","order":0}]}' | jq
echo -e "\n"

# 9. 删除待办事项（注释掉，因为需要保持至少一项）
# echo "9. 测试删除待办事项..."
# curl -s -X DELETE "${BASE_URL}/api/v1/items/${ITEM_ID}" \
#   -H "Authorization: Bearer $TOKEN" | jq
# echo -e "\n"

echo "========================================="
echo "测试完成！"
echo "========================================="
