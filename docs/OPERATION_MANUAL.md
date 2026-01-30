# 设备数字护照溯源系统 - 操作手册

## 目录

1. [系统概述](#1-系统概述)
2. [角色与权限](#2-角色与权限)
3. [管理员操作指南](#3-管理员操作指南)
4. [供应商操作指南](#4-供应商操作指南)
5. [客户/采购商操作指南](#5-客户采购商操作指南)
6. [设备护照码说明](#6-设备护照码说明)
7. [设备状态流转](#7-设备状态流转)
8. [常见问题](#8-常见问题)

---

## 1. 系统概述

### 1.1 系统简介

设备数字护照溯源系统是一套B2B设备全生命周期追溯管理平台。通过为每台设备分配唯一的数字护照码（二维码），实现从生产、质检、打包、发货到售后服务的全流程可追溯。

### 1.2 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      设备数字护照系统                          │
├─────────────────────────────────────────────────────────────┤
│  管理后台 (http://localhost:5174)                            │
│  ├── 管理员：创建护照、分配供应商、管理用户                      │
│  ├── 供应商：更新设备生产状态                                  │
│  └── 客户：查看设备详情、提交服务工单                           │
├─────────────────────────────────────────────────────────────┤
│  公开页面                                                    │
│  ├── 扫码查询：任何人可扫码查看设备公开信息                      │
│  └── 服务申请：提交维修/保养申请                               │
├─────────────────────────────────────────────────────────────┤
│  API文档 (http://localhost:3000/api)                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:5174 | 主系统界面 |
| API文档 | http://localhost:3000/api | Swagger接口文档 |
| 数据库管理 | http://localhost:8080 | Adminer数据库管理 |

---

## 2. 角色与权限

### 2.1 角色层级

```
权限等级从低到高：

PUBLIC (0)        → 公开访问，可扫码查看设备公开信息
    ↓
CUSTOMER (1)      → 客户/采购商，查看设备详情和服务历史
    ↓
ENGINEER (2)      → 工程师，执行服务工单
    ↓
QC_INSPECTOR (3)  → 质检员，更新质检状态
    ↓
OPERATOR (4)      → 操作员/供应商，创建设备、更新生产状态
    ↓
ADMIN (5)         → 管理员，完全控制权限
```

### 2.2 角色权限对照表

| 功能 | PUBLIC | CUSTOMER | ENGINEER | QC_INSPECTOR | OPERATOR | ADMIN |
|------|--------|----------|----------|--------------|----------|-------|
| 扫码查看公开信息 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 提交服务申请 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 查看设备详情 | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| 查看服务历史 | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| 执行服务工单 | - | - | ✓ | ✓ | ✓ | ✓ |
| 更新质检状态 | - | - | - | ✓ | ✓ | ✓ |
| 创建设备护照 | - | - | - | - | ✓ | ✓ |
| 更新生产状态 | - | - | - | - | ✓ | ✓ |
| 管理用户账号 | - | - | - | - | - | ✓ |
| 管理组织机构 | - | - | - | - | - | ✓ |

### 2.3 推荐角色分配

| 人员类型 | 推荐角色 | 说明 |
|----------|----------|------|
| 公司管理员 | ADMIN | 系统最高权限，管理所有功能 |
| 供应商账号 | OPERATOR | 可创建设备护照、更新生产状态 |
| 供应商质检员 | QC_INSPECTOR | 专门负责质检状态更新 |
| 公司采购员 | CUSTOMER | 查看设备状态和历史 |
| 设备采购商 | CUSTOMER | 查看设备状态和历史 |
| 售后工程师 | ENGINEER | 执行维修保养工单 |

---

## 3. 管理员操作指南

### 3.1 登录系统

1. 访问 http://localhost:5174/login
2. 输入管理员账号：
   - 邮箱：`admin@luna.top`
   - 密码：`password123`
3. 点击「Sign In」登录

### 3.2 创建供应商组织

**步骤：**

1. 登录管理后台
2. 通过API创建组织（当前版本需通过API操作）：

```bash
# 获取Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luna.top","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 创建供应商组织
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "XX精密制造有限公司",
    "code": "XXM",
    "type": "SUPPLIER",
    "address": "深圳市宝安区XX路XX号",
    "city": "深圳",
    "country": "China",
    "phone": "+86-755-12345678",
    "email": "contact@xx-manufacturing.com"
  }'
```

### 3.3 创建供应商账号

```bash
# 创建供应商操作员账号
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier1@luna.top",
    "password": "supplier123",
    "name": "供应商操作员",
    "role": "OPERATOR",
    "organizationId": "<供应商组织ID>"
  }'
```

### 3.4 创建设备护照并分配给供应商

当向供应商下达生产订单时，为该订单创建设备护照：

```bash
# 创建设备护照
curl -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productLine": "PLC",
    "originCode": "CN",
    "deviceName": "工业控制器 Model A",
    "deviceModel": "IPC-A100",
    "manufacturer": "XX精密制造",
    "manufacturerPartNumber": "IPC-A100-2025",
    "serialNumber": "SN-2025-00001",
    "supplierId": "<供应商组织ID>",
    "currentLocation": "供应商工厂"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "xxx-xxx-xxx",
    "passportCode": "DP-MED-2025-PLC-CN-000001-XX",
    "status": "CREATED",
    ...
  }
}
```

### 3.5 将护照码发送给供应商

创建护照后，将生成的护照码（如 `DP-MED-2025-PLC-CN-000001-XX`）发送给供应商，供应商即可开始更新设备状态。

### 3.6 查看所有设备

1. 登录后进入「Device Passports」页面
2. 可按状态、产品线筛选设备
3. 点击设备行可查看详情

---

## 4. 供应商操作指南

### 4.1 账号获取

供应商账号由管理员创建并分配，您将收到：
- 登录邮箱
- 初始密码
- 分配的设备护照码

### 4.2 登录系统

1. 访问 http://localhost:5174/login
2. 输入分配的账号密码
3. 登录后可看到管理后台

### 4.3 查找分配的设备

1. 进入「Device Passports」页面
2. 在搜索框输入护照码（如 `DP-MED-2025-PLC-CN-000001`）
3. 点击设备查看详情

### 4.4 更新设备状态

供应商可按生产流程依次更新设备状态：

#### 状态流转顺序：
```
CREATED（已创建）
    ↓
PROCURED（已采购/开始生产）
    ↓
IN_QC（质检中）
    ↓
QC_PASSED（质检通过）
    ↓
IN_ASSEMBLY（装配中）[可选]
    ↓
IN_TESTING（测试中）[可选]
    ↓
TEST_PASSED（测试通过）[可选]
    ↓
PACKAGED（已打包）
    ↓
IN_TRANSIT（运输中）
    ↓
DELIVERED（已交付）
```

#### 更新状态操作：

**方式一：通过界面操作**
1. 进入设备详情页
2. 点击「Update Status」按钮
3. 选择新状态
4. 点击确认

**方式二：通过API操作**
```bash
# 供应商登录获取Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"supplier1@luna.top","password":"supplier123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 更新状态为"生产中"
curl -X PATCH http://localhost:3000/api/v1/passports/<设备ID>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCURED"}'

# 更新状态为"质检中"
curl -X PATCH http://localhost:3000/api/v1/passports/<设备ID>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_QC"}'

# 更新状态为"质检通过"
curl -X PATCH http://localhost:3000/api/v1/passports/<设备ID>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "QC_PASSED"}'

# 更新状态为"已打包"
curl -X PATCH http://localhost:3000/api/v1/passports/<设备ID>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PACKAGED"}'

# 更新状态为"运输中"
curl -X PATCH http://localhost:3000/api/v1/passports/<设备ID>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_TRANSIT"}'
```

### 4.5 典型操作流程

```
收到护照码 → 登录系统 → 查找设备 → 开始生产(PROCURED)
                                      ↓
                              质检(IN_QC → QC_PASSED)
                                      ↓
                              打包(PACKAGED)
                                      ↓
                              发货(IN_TRANSIT)
                                      ↓
                              客户签收后由管理员更新为 DELIVERED
```

---

## 5. 客户/采购商操作指南

### 5.1 扫码查询（无需登录）

任何人都可以通过扫描设备上的二维码查询设备信息：

1. 使用手机扫描设备上的二维码
2. 或访问 http://localhost:5174/scan
3. 手动输入护照码（如 `DP-MED-2025-PLC-CN-000001-XX`）
4. 查看设备公开信息：
   - 设备名称和型号
   - 制造商
   - 当前状态
   - 生产日期
   - 质保状态

### 5.2 登录查看详细信息

如需查看更多详细信息，需使用客户账号登录：

1. 访问 http://localhost:5174/login
2. 使用客户账号登录
3. 进入「Device Passports」查看设备列表
4. 点击设备查看完整信息：
   - 完整规格参数
   - 供应商信息
   - 生命周期事件记录
   - 服务历史

### 5.3 提交服务申请

当设备需要维修或保养时：

**方式一：扫码后直接申请**
1. 扫描设备二维码
2. 在设备信息页点击「Request Service」
3. 填写服务申请表单
4. 提交申请

**方式二：登录后申请**
1. 登录客户账号
2. 进入「Service Orders」
3. 点击「New Service Order」
4. 选择设备并填写服务需求
5. 提交申请

---

## 6. 设备护照码说明

### 6.1 护照码格式

```
DP-{公司代码}-{年份}-{产品线}-{产地}-{序号}-{校验码}

示例：DP-MED-2025-PLC-CN-000001-2F
```

### 6.2 各部分含义

| 部分 | 长度 | 说明 | 示例 |
|------|------|------|------|
| DP | 2 | 固定前缀（Device Passport） | DP |
| 公司代码 | 3 | 贵公司代码 | MED |
| 年份 | 4 | 生产年份 | 2025 |
| 产品线 | 3 | 产品类型代码 | PLC |
| 产地 | 2 | 原产国/地区代码 | CN |
| 序号 | 6 | 自增序列号 | 000001 |
| 校验码 | 2 | 防伪校验码 | 2F |

### 6.3 产品线代码

| 代码 | 说明 |
|------|------|
| PLC | 可编程逻辑控制器 |
| MOT | 电机/驱动器 |
| SEN | 传感器 |
| CTL | 控制器 |
| ROB | 机器人 |
| HMI | 人机界面 |
| INV | 变频器 |
| VLV | 阀门 |
| PCB | 电路板 |
| OTH | 其他 |

### 6.4 产地代码

| 代码 | 国家/地区 |
|------|-----------|
| CN | 中国 |
| DE | 德国 |
| US | 美国 |
| JP | 日本 |
| KR | 韩国 |
| TW | 台湾 |

---

## 7. 设备状态流转

### 7.1 完整状态列表

| 状态 | 英文 | 说明 | 可操作角色 |
|------|------|------|------------|
| 已创建 | CREATED | 护照已创建，等待生产 | ADMIN, OPERATOR |
| 已采购 | PROCURED | 开始生产/采购 | ADMIN, OPERATOR |
| 质检中 | IN_QC | 正在质检 | ADMIN, OPERATOR, QC_INSPECTOR |
| 质检通过 | QC_PASSED | 质检合格 | ADMIN, QC_INSPECTOR |
| 质检失败 | QC_FAILED | 质检不合格 | ADMIN, QC_INSPECTOR |
| 装配中 | IN_ASSEMBLY | 正在装配 | ADMIN, OPERATOR |
| 测试中 | IN_TESTING | 正在测试 | ADMIN, OPERATOR |
| 测试通过 | TEST_PASSED | 测试合格 | ADMIN, OPERATOR |
| 已打包 | PACKAGED | 已完成打包 | ADMIN, OPERATOR |
| 运输中 | IN_TRANSIT | 正在运输 | ADMIN, OPERATOR |
| 已交付 | DELIVERED | 已交付客户 | ADMIN |
| 服务中 | IN_SERVICE | 正常使用中 | ADMIN |
| 维护中 | UNDER_MAINTENANCE | 正在维护 | ADMIN, ENGINEER |
| 已退役 | RETIRED | 已报废/退役 | ADMIN |

### 7.2 状态流转图

```
                    ┌──────────────┐
                    │   CREATED    │ 护照创建
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   PROCURED   │ 开始生产
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │    IN_QC     │ 质检中
                    └──────┬───────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
       ┌──────────────┐          ┌──────────────┐
       │  QC_PASSED   │          │  QC_FAILED   │ → 返工
       └──────┬───────┘          └──────────────┘
              ↓
       ┌──────────────┐
       │ IN_ASSEMBLY  │ (可选)
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │ IN_TESTING   │ (可选)
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │ TEST_PASSED  │ (可选)
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │   PACKAGED   │ 已打包
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │  IN_TRANSIT  │ 运输中
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │  DELIVERED   │ 已交付
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │  IN_SERVICE  │ 使用中
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │   RETIRED    │ 已退役
       └──────────────┘
```

---

## 8. 常见问题

### Q1: 供应商无法更新设备状态？

**可能原因：**
1. 账号权限不足 - 确保账号角色为 OPERATOR 或更高
2. 设备未分配给该供应商 - 联系管理员确认
3. 状态流转不合规 - 必须按顺序更新状态

### Q2: 扫码显示"设备未找到"？

**可能原因：**
1. 护照码输入错误 - 检查是否有拼写错误
2. 设备尚未创建 - 联系管理员确认
3. 校验码不匹配 - 护照码可能被篡改

### Q3: 如何批量创建设备护照？

目前需通过API批量创建，后续版本将支持Excel导入。

```bash
# 批量创建示例脚本
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/passports \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"productLine\": \"PLC\",
      \"originCode\": \"CN\",
      \"deviceName\": \"工业控制器 #$i\",
      \"deviceModel\": \"IPC-A100\",
      \"manufacturer\": \"XX制造\"
    }"
done
```

### Q4: 如何查看设备的完整历史记录？

1. 登录管理后台
2. 进入设备详情页
3. 查看「Lifecycle Events」部分
4. 所有状态变更都会被记录

### Q5: 忘记密码怎么办？

请联系系统管理员重置密码。

---

## 附录A：测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@luna.top | password123 |
| 操作员 | operator@luna.top | password123 |
| 工程师 | engineer@luna.top | password123 |
| 质检员 | qc@luna.top | password123 |
| 客户 | customer@luna.top | password123 |

---

## 附录B：API快速参考

### 认证
```bash
# 登录
POST /api/v1/auth/login
Body: {"email": "xxx", "password": "xxx"}

# 获取当前用户
GET /api/v1/auth/me
Header: Authorization: Bearer <token>
```

### 设备护照
```bash
# 创建护照
POST /api/v1/passports

# 获取列表
GET /api/v1/passports

# 获取详情
GET /api/v1/passports/:id

# 更新状态
PATCH /api/v1/passports/:id/status
Body: {"status": "IN_QC"}

# 公开扫码查询
GET /api/v1/scan/:code
```

### 服务工单
```bash
# 创建工单
POST /api/v1/service-orders

# 获取列表
GET /api/v1/service-orders

# 更新工单
PATCH /api/v1/service-orders/:id
```

---

*文档版本：1.0*
*更新日期：2025年1月*
*系统版本：Device Passport System MVP*
