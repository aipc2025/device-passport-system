# 设备数字护照系统 - 上线前验证清单

## 验证环境信息

| 项目 | 地址 |
|------|------|
| 前端应用 | http://localhost:5174 |
| 后端API | http://localhost:3000 |
| API文档 | http://localhost:3000/api |
| 数据库管理 | http://localhost:8080 |

---

## 一、基础设施验证

### 1.1 服务启动状态

| 序号 | 验证项 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 1.1.1 | PostgreSQL数据库 | `docker ps \| grep device-passport-db` | 状态为 Up (healthy) | □ 通过 □ 失败 |
| 1.1.2 | Redis缓存 | `docker ps \| grep device-passport-redis` | 状态为 Up (healthy) | □ 通过 □ 失败 |
| 1.1.3 | 后端API服务 | 访问 http://localhost:3000/api | 显示Swagger文档 | □ 通过 □ 失败 |
| 1.1.4 | 前端Web服务 | 访问 http://localhost:5174 | 显示首页 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 检查Docker容器状态
docker ps --format "table {{.Names}}\t{{.Status}}"

# 检查API健康
curl -s http://localhost:3000/api | head -5

# 检查前端
curl -s http://localhost:5174 | head -5
```

---

## 二、认证模块验证

### 2.1 用户登录

| 序号 | 验证项 | 测试账号 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 2.1.1 | 管理员登录 | admin@luna.top | 界面登录 | 成功进入Dashboard | □ 通过 □ 失败 |
| 2.1.2 | 操作员登录 | operator@luna.top | 界面登录 | 成功进入Dashboard | □ 通过 □ 失败 |
| 2.1.3 | 工程师登录 | engineer@luna.top | 界面登录 | 成功进入Dashboard | □ 通过 □ 失败 |
| 2.1.4 | 质检员登录 | qc@luna.top | 界面登录 | 成功进入Dashboard | □ 通过 □ 失败 |
| 2.1.5 | 客户登录 | customer@luna.top | 界面登录 | 成功进入Dashboard | □ 通过 □ 失败 |
| 2.1.6 | 错误密码 | admin@luna.top / wrongpass | 界面登录 | 显示"Invalid credentials" | □ 通过 □ 失败 |
| 2.1.7 | 不存在用户 | notexist@luna.top | 界面登录 | 显示"Invalid credentials" | □ 通过 □ 失败 |

**API验证命令：**
```bash
# 2.1.1 管理员登录
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}'
# 预期：返回 {"success":true,"data":{"user":{...},"accessToken":"..."}}

# 2.1.6 错误密码
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"wrongpassword"}'
# 预期：返回 {"message":"Invalid credentials","error":"Unauthorized","statusCode":401}
```

### 2.2 Token验证

| 序号 | 验证项 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 2.2.1 | 有效Token访问 | 使用有效Token调用API | 返回数据 | □ 通过 □ 失败 |
| 2.2.2 | 无效Token访问 | 使用伪造Token调用API | 返回401错误 | □ 通过 □ 失败 |
| 2.2.3 | 无Token访问 | 不带Token调用受保护API | 返回401错误 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 获取有效Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2.2.1 有效Token
curl -s http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $TOKEN"
# 预期：返回护照列表

# 2.2.2 无效Token
curl -s http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer invalid_token_here"
# 预期：返回 401 Unauthorized

# 2.2.3 无Token
curl -s http://localhost:3000/api/v1/passports
# 预期：返回 401 Unauthorized
```

---

## 三、公开扫码功能验证

### 3.1 扫码查询（无需登录）

| 序号 | 验证项 | 测试数据 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 3.1.1 | 有效护照码查询 | DP-MED-2025-PLC-DE-000001-2F | API调用 | 返回设备公开信息 | □ 通过 □ 失败 |
| 3.1.2 | 界面扫码查询 | DP-MED-2025-PLC-DE-000001-2F | 访问/scan页面输入 | 显示设备信息卡片 | □ 通过 □ 失败 |
| 3.1.3 | 无效护照码 | DP-MED-2025-PLC-DE-000001-XX | API调用 | 返回校验码错误 | □ 通过 □ 失败 |
| 3.1.4 | 不存在护照码 | DP-MED-2025-PLC-DE-999999-XX | API调用 | 返回未找到错误 | □ 通过 □ 失败 |
| 3.1.5 | 格式错误护照码 | INVALID-CODE | API调用 | 返回格式错误 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 3.1.1 有效护照码
curl -s http://localhost:3000/api/v1/scan/DP-MED-2025-PLC-DE-000001-2F
# 预期：返回 {"success":true,"data":{"passportCode":"...","deviceName":"...","status":"..."}}

# 3.1.3 无效校验码
curl -s http://localhost:3000/api/v1/scan/DP-MED-2025-PLC-DE-000001-XX
# 预期：返回 {"message":"Invalid checksum","error":"Bad Request","statusCode":400}

# 3.1.5 格式错误
curl -s http://localhost:3000/api/v1/scan/INVALID-CODE
# 预期：返回 {"message":"Invalid passport code format","error":"Bad Request","statusCode":400}
```

**界面验证步骤：**
1. 访问 http://localhost:5174/scan
2. 在输入框中输入护照码
3. 点击查询按钮
4. 验证显示的设备信息

---

## 四、设备护照管理验证

### 4.1 创建设备护照

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 4.1.1 | 管理员创建护照 | ADMIN | API创建 | 成功，返回护照信息 | □ 通过 □ 失败 |
| 4.1.2 | 操作员创建护照 | OPERATOR | API创建 | 成功，返回护照信息 | □ 通过 □ 失败 |
| 4.1.3 | 客户创建护照 | CUSTOMER | API创建 | 失败，权限不足 | □ 通过 □ 失败 |
| 4.1.4 | 护照码自动生成 | ADMIN | 创建后检查 | 自动生成有效护照码 | □ 通过 □ 失败 |
| 4.1.5 | 界面创建护照 | ADMIN | 前端界面操作 | 成功创建并跳转详情 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 获取管理员Token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 4.1.1 管理员创建护照
curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "SEN",
    "originCode": "CN",
    "deviceName": "温度传感器 T100",
    "deviceModel": "T100-A",
    "manufacturer": "测试制造商",
    "serialNumber": "TEST-SN-001"
  }'
# 预期：返回创建的护照信息，包含自动生成的passportCode

# 获取客户Token
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 4.1.3 客户创建护照（应失败）
curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "SEN",
    "originCode": "CN",
    "deviceName": "非法创建测试",
    "deviceModel": "T100",
    "manufacturer": "测试"
  }'
# 预期：返回 403 Forbidden
```

### 4.2 查询设备护照

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 4.2.1 | 获取护照列表 | 任意登录用户 | API调用 | 返回护照列表和分页信息 | □ 通过 □ 失败 |
| 4.2.2 | 按状态筛选 | 任意登录用户 | API带status参数 | 返回筛选后列表 | □ 通过 □ 失败 |
| 4.2.3 | 按护照码搜索 | 任意登录用户 | API带search参数 | 返回匹配护照 | □ 通过 □ 失败 |
| 4.2.4 | 获取护照详情 | 任意登录用户 | API调用 | 返回完整护照信息 | □ 通过 □ 失败 |
| 4.2.5 | 界面列表显示 | 任意登录用户 | 前端界面 | 正确显示列表和分页 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 4.2.1 获取列表
curl -s "http://localhost:3000/api/v1/passports" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：返回 {"success":true,"data":{"data":[...],"meta":{"total":...,"page":...}}}

# 4.2.2 按状态筛选
curl -s "http://localhost:3000/api/v1/passports?status=IN_SERVICE" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：仅返回状态为IN_SERVICE的护照

# 4.2.3 搜索
curl -s "http://localhost:3000/api/v1/passports?search=S7-1500" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：返回包含S7-1500的护照

# 4.2.4 获取详情（需替换实际ID）
curl -s "http://localhost:3000/api/v1/passports/<PASSPORT_ID>" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：返回完整护照详情
```

### 4.3 更新设备状态

| 序号 | 验证项 | 测试数据 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 4.3.1 | CREATED→PROCURED | 新创建的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.2 | PROCURED→IN_QC | 状态为PROCURED的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.3 | IN_QC→QC_PASSED | 状态为IN_QC的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.4 | QC_PASSED→PACKAGED | 状态为QC_PASSED的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.5 | PACKAGED→IN_TRANSIT | 状态为PACKAGED的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.6 | IN_TRANSIT→DELIVERED | 状态为IN_TRANSIT的护照 | API更新 | 成功更新 | □ 通过 □ 失败 |
| 4.3.7 | 非法状态跳转 | CREATED→DELIVERED | API更新 | 失败，状态转换非法 | □ 通过 □ 失败 |
| 4.3.8 | 权限验证-客户更新 | CUSTOMER角色 | API更新 | 失败，权限不足 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 首先创建一个测试护照
PASSPORT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "MOT",
    "originCode": "DE",
    "deviceName": "状态测试电机",
    "deviceModel": "M100",
    "manufacturer": "测试厂商"
  }')
echo $PASSPORT_RESPONSE

# 提取护照ID（手动替换或使用jq）
PASSPORT_ID="<从上面响应中获取的ID>"

# 4.3.1 CREATED → PROCURED
curl -s -X PATCH "http://localhost:3000/api/v1/passports/$PASSPORT_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCURED"}'
# 预期：成功，状态变为PROCURED

# 4.3.2 PROCURED → IN_QC
curl -s -X PATCH "http://localhost:3000/api/v1/passports/$PASSPORT_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_QC"}'
# 预期：成功，状态变为IN_QC

# 4.3.7 非法跳转测试（先创建新护照）
curl -s -X PATCH "http://localhost:3000/api/v1/passports/<NEW_PASSPORT_ID>/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "DELIVERED"}'
# 预期：失败，返回状态转换非法错误
```

---

## 五、服务工单验证

### 5.1 创建服务工单

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 5.1.1 | 客户创建工单 | CUSTOMER | API创建 | 成功创建 | □ 通过 □ 失败 |
| 5.1.2 | 公开服务申请 | 无需登录 | API创建 | 成功创建 | □ 通过 □ 失败 |
| 5.1.3 | 界面创建工单 | CUSTOMER | 前端界面 | 成功创建 | □ 通过 □ 失败 |
| 5.1.4 | 必填字段验证 | 任意 | 缺少必填字段 | 返回验证错误 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 5.1.1 客户创建工单
curl -s -X POST http://localhost:3000/api/v1/service-orders \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "passportCode": "DP-MED-2025-PLC-DE-000001-2F",
    "serviceType": "REPAIR",
    "priority": "MEDIUM",
    "title": "设备通讯故障",
    "description": "PLC与HMI通讯间歇性断开",
    "contactName": "张三",
    "contactPhone": "13800138000",
    "contactEmail": "zhangsan@luna.top",
    "serviceAddress": "上海市浦东新区XX路XX号"
  }'
# 预期：返回创建的工单信息

# 5.1.4 缺少必填字段
curl -s -X POST http://localhost:3000/api/v1/service-orders \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "passportCode": "DP-MED-2025-PLC-DE-000001-2F",
    "serviceType": "REPAIR"
  }'
# 预期：返回验证错误
```

### 5.2 工单流程管理

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 5.2.1 | 查看工单列表 | 任意登录用户 | API调用 | 返回工单列表 | □ 通过 □ 失败 |
| 5.2.2 | 分配工程师 | ADMIN | API更新 | 成功分配 | □ 通过 □ 失败 |
| 5.2.3 | 更新工单状态 | ENGINEER | API更新 | 成功更新 | □ 通过 □ 失败 |
| 5.2.4 | 完成工单 | ENGINEER | API更新 | 状态变为COMPLETED | □ 通过 □ 失败 |

**验证命令：**
```bash
# 5.2.1 查看工单列表
curl -s http://localhost:3000/api/v1/service-orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：返回工单列表

# 5.2.2 分配工程师（需替换工单ID和工程师ID）
curl -s -X PATCH "http://localhost:3000/api/v1/service-orders/<ORDER_ID>" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedEngineerId": "<ENGINEER_USER_ID>",
    "status": "ASSIGNED"
  }'
# 预期：成功分配
```

---

## 六、用户管理验证

### 6.1 用户查询

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 6.1.1 | 管理员查看用户列表 | ADMIN | API调用 | 返回用户列表 | □ 通过 □ 失败 |
| 6.1.2 | 非管理员查看用户 | OPERATOR | API调用 | 权限不足或受限 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 6.1.1 管理员查看用户
curl -s http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# 预期：返回用户列表（密码字段不应显示）
```

---

## 七、组织管理验证

### 7.1 组织CRUD

| 序号 | 验证项 | 测试角色 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|----------|
| 7.1.1 | 查看组织列表 | ADMIN | API调用 | 返回组织列表 | □ 通过 □ 失败 |
| 7.1.2 | 创建供应商组织 | ADMIN | API创建 | 成功创建 | □ 通过 □ 失败 |
| 7.1.3 | 创建客户组织 | ADMIN | API创建 | 成功创建 | □ 通过 □ 失败 |

**验证命令：**
```bash
# 7.1.1 查看组织
curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7.1.2 创建供应商
curl -s -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新供应商公司",
    "code": "NSP",
    "type": "SUPPLIER",
    "address": "测试地址",
    "city": "深圳",
    "country": "China",
    "email": "supplier@luna.top"
  }'
# 预期：返回创建的组织信息
```

---

## 八、前端界面验证

### 8.1 公开页面

| 序号 | 验证项 | 验证步骤 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 8.1.1 | 首页显示 | 访问 http://localhost:5174 | 正确显示首页内容 | □ 通过 □ 失败 |
| 8.1.2 | 扫码页面 | 访问 /scan，输入护照码 | 显示设备信息 | □ 通过 □ 失败 |
| 8.1.3 | 设备公开信息 | 点击扫码结果 | 显示详细公开信息 | □ 通过 □ 失败 |
| 8.1.4 | 服务申请页 | 访问 /service-request | 显示申请表单 | □ 通过 □ 失败 |
| 8.1.5 | 登录页面 | 访问 /login | 显示登录表单 | □ 通过 □ 失败 |
| 8.1.6 | 注册页面 | 访问 /register | 显示注册表单 | □ 通过 □ 失败 |

### 8.2 管理后台

| 序号 | 验证项 | 验证步骤 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 8.2.1 | Dashboard | 登录后访问 /dashboard | 显示仪表盘 | □ 通过 □ 失败 |
| 8.2.2 | 护照列表 | 访问 /passports | 显示护照列表 | □ 通过 □ 失败 |
| 8.2.3 | 创建护照 | 点击新建按钮 | 显示创建表单 | □ 通过 □ 失败 |
| 8.2.4 | 护照详情 | 点击列表中的护照 | 显示详情页 | □ 通过 □ 失败 |
| 8.2.5 | 状态更新 | 在详情页更新状态 | 成功更新 | □ 通过 □ 失败 |
| 8.2.6 | 工单列表 | 访问 /service-orders | 显示工单列表 | □ 通过 □ 失败 |
| 8.2.7 | 退出登录 | 点击退出按钮 | 返回登录页 | □ 通过 □ 失败 |

---

## 九、完整业务流程验证

### 9.1 供应商生产流程

**场景：** 管理员创建护照→分配给供应商→供应商更新生产状态→客户追踪

| 步骤 | 操作 | 执行角色 | 预期结果 | 实际结果 |
|------|------|----------|----------|----------|
| 1 | 创建设备护照 | ADMIN | 获得护照码 | □ 通过 □ 失败 |
| 2 | 记录护照码，通知供应商 | ADMIN | - | □ 通过 □ 失败 |
| 3 | 供应商登录系统 | OPERATOR | 成功登录 | □ 通过 □ 失败 |
| 4 | 搜索护照码 | OPERATOR | 找到设备 | □ 通过 □ 失败 |
| 5 | 更新为"生产中" (PROCURED) | OPERATOR | 成功 | □ 通过 □ 失败 |
| 6 | 更新为"质检中" (IN_QC) | OPERATOR | 成功 | □ 通过 □ 失败 |
| 7 | 更新为"质检通过" (QC_PASSED) | OPERATOR/QC | 成功 | □ 通过 □ 失败 |
| 8 | 更新为"已打包" (PACKAGED) | OPERATOR | 成功 | □ 通过 □ 失败 |
| 9 | 更新为"运输中" (IN_TRANSIT) | OPERATOR | 成功 | □ 通过 □ 失败 |
| 10 | 客户扫码查看状态 | 无需登录 | 显示"运输中" | □ 通过 □ 失败 |
| 11 | 管理员确认交付 (DELIVERED) | ADMIN | 成功 | □ 通过 □ 失败 |
| 12 | 客户再次扫码 | 无需登录 | 显示"已交付" | □ 通过 □ 失败 |

**完整验证脚本：**
```bash
#!/bin/bash
echo "=== 业务流程验证脚本 ==="

# 1. 管理员登录
echo "1. 管理员登录..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "   Token获取成功"

# 2. 创建设备护照
echo "2. 创建设备护照..."
PASSPORT_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "CTL",
    "originCode": "CN",
    "deviceName": "流程测试控制器",
    "deviceModel": "FC-100",
    "manufacturer": "流程测试厂商"
  }')
echo "   结果: $PASSPORT_RESULT"

# 从结果中提取护照码和ID（需要手动记录或使用jq）
echo ""
echo "请记录上面返回的 passportCode 和 id"
echo "然后继续执行后续步骤..."
```

### 9.2 售后服务流程

**场景：** 客户提交服务申请→管理员分配工程师→工程师完成服务

| 步骤 | 操作 | 执行角色 | 预期结果 | 实际结果 |
|------|------|----------|----------|----------|
| 1 | 客户扫码发现问题 | PUBLIC | 看到设备信息 | □ 通过 □ 失败 |
| 2 | 提交服务申请 | PUBLIC | 成功提交 | □ 通过 □ 失败 |
| 3 | 管理员查看新工单 | ADMIN | 看到工单 | □ 通过 □ 失败 |
| 4 | 分配工程师 | ADMIN | 成功分配 | □ 通过 □ 失败 |
| 5 | 工程师查看工单 | ENGINEER | 看到分配的工单 | □ 通过 □ 失败 |
| 6 | 工程师开始处理 | ENGINEER | 状态变为IN_PROGRESS | □ 通过 □ 失败 |
| 7 | 工程师完成工单 | ENGINEER | 状态变为COMPLETED | □ 通过 □ 失败 |

---

## 十、安全验证

### 10.1 权限控制

| 序号 | 验证项 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 10.1.1 | 客户无法创建护照 | CUSTOMER调用创建API | 返回403 | □ 通过 □ 失败 |
| 10.1.2 | 客户无法更新状态 | CUSTOMER调用状态API | 返回403 | □ 通过 □ 失败 |
| 10.1.3 | 工程师无法创建护照 | ENGINEER调用创建API | 返回403 | □ 通过 □ 失败 |
| 10.1.4 | 密码不在响应中 | 查看用户列表 | 无password字段 | □ 通过 □ 失败 |

### 10.2 输入验证

| 序号 | 验证项 | 验证方法 | 预期结果 | 实际结果 |
|------|--------|----------|----------|----------|
| 10.2.1 | SQL注入防护 | 在搜索中输入SQL | 无SQL执行 | □ 通过 □ 失败 |
| 10.2.2 | XSS防护 | 在输入中插入脚本 | 脚本被转义 | □ 通过 □ 失败 |
| 10.2.3 | 邮箱格式验证 | 输入非法邮箱 | 返回验证错误 | □ 通过 □ 失败 |

---

## 十一、验证结果汇总

### 验证统计

| 模块 | 总项数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 基础设施 | 4 | | | |
| 认证模块 | 10 | | | |
| 扫码功能 | 5 | | | |
| 护照管理 | 16 | | | |
| 服务工单 | 8 | | | |
| 用户管理 | 2 | | | |
| 组织管理 | 3 | | | |
| 前端界面 | 13 | | | |
| 业务流程 | 19 | | | |
| 安全验证 | 7 | | | |
| **总计** | **87** | | | |

### 验证结论

- [ ] 全部通过，可以上线
- [ ] 存在问题，需要修复后重新验证

### 问题记录

| 序号 | 验证项 | 问题描述 | 严重程度 | 处理状态 |
|------|--------|----------|----------|----------|
| | | | | |

---

## 附录：快速验证脚本

将以下内容保存为 `verify.sh` 可快速执行关键验证：

```bash
#!/bin/bash
echo "========================================"
echo "设备数字护照系统 - 快速验证脚本"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

# 1. 检查服务
echo ""
echo "1. 检查服务状态..."
curl -s http://localhost:3000/api > /dev/null && pass "API服务正常" || fail "API服务异常"
curl -s http://localhost:5174 > /dev/null && pass "前端服务正常" || fail "前端服务异常"

# 2. 登录测试
echo ""
echo "2. 登录测试..."
RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}')
echo $RESULT | grep -q "accessToken" && pass "管理员登录成功" || fail "管理员登录失败"

TOKEN=$(echo $RESULT | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 3. 扫码测试
echo ""
echo "3. 扫码测试..."
SCAN=$(curl -s http://localhost:3000/api/v1/scan/DP-MED-2025-PLC-DE-000001-2F)
echo $SCAN | grep -q "passportCode" && pass "扫码查询成功" || fail "扫码查询失败"

# 4. 护照列表
echo ""
echo "4. 护照管理测试..."
LIST=$(curl -s http://localhost:3000/api/v1/passports -H "Authorization: Bearer $TOKEN")
echo $LIST | grep -q "data" && pass "护照列表获取成功" || fail "护照列表获取失败"

# 5. 权限测试
echo ""
echo "5. 权限测试..."
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

CREATE=$(curl -s -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productLine":"PLC","originCode":"CN","deviceName":"Test","deviceModel":"T1","manufacturer":"Test"}')
echo $CREATE | grep -q "Forbidden\|403" && pass "客户创建护照被正确拒绝" || fail "权限控制异常"

echo ""
echo "========================================"
echo "快速验证完成"
echo "========================================"
```

---

*验证清单版本：1.0*
*创建日期：2025年1月*
