#!/bin/bash
echo "========================================"
echo "设备数字护照系统 - 快速验证脚本"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASSED++)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAILED++)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

PASSED=0
FAILED=0

# ==========================================
# 1. 基础服务检查
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. 基础服务检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# API服务
curl -s http://localhost:3000/api > /dev/null 2>&1
if [ $? -eq 0 ]; then
    pass "后端API服务 (localhost:3000)"
else
    fail "后端API服务 (localhost:3000)"
fi

# 前端服务
curl -s http://localhost:5174 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    pass "前端Web服务 (localhost:5174)"
else
    fail "前端Web服务 (localhost:5174)"
fi

# Docker容器
docker ps | grep -q "device-passport-db" && pass "PostgreSQL数据库" || fail "PostgreSQL数据库"
docker ps | grep -q "device-passport-redis" && pass "Redis缓存" || fail "Redis缓存"

# ==========================================
# 2. 认证模块测试
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. 认证模块测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 管理员登录
ADMIN_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}')

if echo $ADMIN_RESULT | grep -q "accessToken"; then
    pass "管理员登录 (admin@luna.top)"
    ADMIN_TOKEN=$(echo $ADMIN_RESULT | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    fail "管理员登录 (admin@luna.top)"
fi

# 操作员登录
OPERATOR_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@luna.top","password":"password123"}')
echo $OPERATOR_RESULT | grep -q "accessToken" && pass "操作员登录 (operator@luna.top)" || fail "操作员登录"
OPERATOR_TOKEN=$(echo $OPERATOR_RESULT | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 客户登录
CUSTOMER_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@luna.top","password":"password123"}')
echo $CUSTOMER_RESULT | grep -q "accessToken" && pass "客户登录 (customer@luna.top)" || fail "客户登录"
CUSTOMER_TOKEN=$(echo $CUSTOMER_RESULT | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 错误密码测试
WRONG_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"wrongpassword"}')
echo $WRONG_RESULT | grep -q "Unauthorized\|Invalid" && pass "错误密码拒绝" || fail "错误密码拒绝"

# ==========================================
# 3. 公开扫码功能
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. 公开扫码功能测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 有效护照码
SCAN1=$(curl -s http://localhost:3000/api/v1/scan/DP-MED-2025-PLC-DE-000001-2F)
echo $SCAN1 | grep -q "passportCode" && pass "有效护照码查询" || fail "有效护照码查询"

# 无效校验码
SCAN2=$(curl -s http://localhost:3000/api/v1/scan/DP-MED-2025-PLC-DE-000001-XX)
echo $SCAN2 | grep -q "Invalid checksum\|Bad Request" && pass "无效校验码拒绝" || fail "无效校验码拒绝"

# 格式错误
SCAN3=$(curl -s http://localhost:3000/api/v1/scan/INVALID-CODE)
echo $SCAN3 | grep -q "Invalid\|Bad Request" && pass "格式错误拒绝" || fail "格式错误拒绝"

# ==========================================
# 4. 护照管理测试
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. 护照管理测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 获取护照列表
LIST=$(curl -s http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $LIST | grep -q "data" && pass "护照列表获取" || fail "护照列表获取"

# 创建护照
CREATE=$(curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "SEN",
    "originCode": "CN",
    "deviceName": "验证测试传感器",
    "deviceModel": "VT-100",
    "manufacturer": "验证测试厂商"
  }')

if echo $CREATE | grep -q "passportCode"; then
    pass "创建护照"
    NEW_PASSPORT_ID=$(echo $CREATE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    NEW_PASSPORT_CODE=$(echo $CREATE | grep -o '"passportCode":"[^"]*' | cut -d'"' -f4)
    info "新护照码: $NEW_PASSPORT_CODE"
else
    fail "创建护照"
fi

# 状态更新测试
if [ ! -z "$NEW_PASSPORT_ID" ]; then
    UPDATE1=$(curl -s -X PATCH "http://localhost:3000/api/v1/passports/$NEW_PASSPORT_ID/status" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status": "PROCURED"}')
    echo $UPDATE1 | grep -q "PROCURED" && pass "状态更新 CREATED→PROCURED" || fail "状态更新"
fi

# ==========================================
# 5. 权限控制测试
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. 权限控制测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 客户创建护照（应被拒绝）
CUSTOMER_CREATE=$(curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productLine":"PLC","originCode":"CN","deviceName":"非法测试","deviceModel":"T1","manufacturer":"Test"}')
echo $CUSTOMER_CREATE | grep -q "Forbidden\|403" && pass "客户创建护照被拒绝" || fail "客户创建护照被拒绝"

# 无Token访问
NO_TOKEN=$(curl -s http://localhost:3000/api/v1/passports)
echo $NO_TOKEN | grep -q "Unauthorized\|401" && pass "无Token访问被拒绝" || fail "无Token访问被拒绝"

# ==========================================
# 6. 服务工单测试
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. 服务工单测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 创建服务工单
ORDER_CREATE=$(curl -s -X POST http://localhost:3000/api/v1/service-orders \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "passportCode": "DP-MED-2025-PLC-DE-000001-2F",
    "serviceType": "MAINTENANCE",
    "priority": "LOW",
    "title": "验证测试工单",
    "description": "这是验证脚本创建的测试工单",
    "contactName": "验证测试",
    "contactPhone": "13800000000",
    "serviceAddress": "测试地址"
  }')
echo $ORDER_CREATE | grep -q "orderNumber" && pass "创建服务工单" || fail "创建服务工单"

# 获取工单列表
ORDER_LIST=$(curl -s http://localhost:3000/api/v1/service-orders \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $ORDER_LIST | grep -q "data" && pass "服务工单列表" || fail "服务工单列表"

# ==========================================
# 7. 用户和组织管理
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. 用户和组织管理测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 用户列表
USERS=$(curl -s http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $USERS | grep -q "email" && pass "用户列表获取" || fail "用户列表获取"

# 检查密码不在响应中
echo $USERS | grep -q "password" && fail "密码字段暴露" || pass "密码字段已隐藏"

# 组织列表
ORGS=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $ORGS | grep -q "name\|code" && pass "组织列表获取" || fail "组织列表获取"

# ==========================================
# 验证结果汇总
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "验证结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
TOTAL=$((PASSED + FAILED))
echo -e "总计测试项: ${TOTAL}"
echo -e "${GREEN}通过: ${PASSED}${NC}"
echo -e "${RED}失败: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================"
    echo "  所有验证项通过！系统可以上线"
    echo -e "========================================${NC}"
else
    echo -e "${RED}========================================"
    echo "  存在 ${FAILED} 项验证失败，请检查修复"
    echo -e "========================================${NC}"
fi

echo ""
echo "验证完成时间: $(date)"
