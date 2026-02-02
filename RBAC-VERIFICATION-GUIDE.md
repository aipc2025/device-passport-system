# RBAC系统验证指南

## 概述

本指南说明如何验证多租户RBAC（角色基础访问控制）系统的完整功能，包括组织隔离、细粒度权限、工作流管理等。

## 已实现的功能

### 1. 细化权限系统 ✅

根据RBAC-SOLUTION.md的建议，实现了更细粒度的权限：

```typescript
// 三级权限粒度：resource.action.scope
'device.view.own'    // 只看自己创建的设备
'device.view.org'    // 看组织内所有设备
'device.view.all'    // 看所有组织的设备（平台管理员）

'qc.approve'         // 质检审批
'workflow.qc-to-package'   // QC → 打包 工作流转换
'workflow.package-to-ship' // 打包 → 发货 工作流转换
```

### 2. 工作流状态机 ✅

实现了完整的设备生命周期工作流验证：

**WorkflowService** 功能：
- ✅ 状态转换验证（QC → 打包 → 发货）
- ✅ 权限检查（只有对应角色能执行特定转换）
- ✅ 前置条件验证（打包前必须QC通过）
- ✅ 业务逻辑约束（发货前必须有物流单号）

**工作流示例：**
```typescript
// 质检 → 打包
{
  fromStatus: DeviceStatus.QC_PASSED,
  toStatus: DeviceStatus.PACKAGED,
  requiredPermission: 'workflow.package-to-ship',
  conditions: {
    requireQCApproval: true,  // 必须先通过质检
  }
}

// 打包 → 发货
{
  fromStatus: DeviceStatus.PACKAGED,
  toStatus: DeviceStatus.IN_TRANSIT,
  requiredPermission: 'workflow.ship-to-transit',
  conditions: {
    requirePackageComplete: true,
    requireTrackingNumber: true,  // 必须有物流单号
  }
}
```

### 3. 测试数据 ✅

创建了全面的测试数据种子脚本（`rbac-test-data.seed.ts`）：

**3个组织：**
- Luna Medical Platform（平台方 - INTERNAL）
- Siemens China（供应商 - SUPPLIER）
- Sinopec（客户 - CUSTOMER）

**11个测试用户：**

| 组织 | 邮箱 | 角色 | 权限特点 |
|------|------|------|---------|
| 平台 | admin@luna.medical | ADMIN | ⭐ 全部权限 |
| 平台 | qc@luna.medical | QC_INSPECTOR | ⭐ 可覆盖供应商QC |
| 平台 | operator@luna.medical | OPERATOR | 管理设备和订单 |
| 西门子 | admin@siemens.com.cn | SUPPLIER_ADMIN | 管理供应商组织 |
| 西门子 | qc.wang@siemens.com.cn | SUPPLIER_QC | ⭐ 只能看PLC产品线 |
| 西门子 | qc.li@siemens.com.cn | SUPPLIER_QC | 看所有产品线 |
| 西门子 | packer.liu@siemens.com.cn | SUPPLIER_PACKER | 打包员 |
| 西门子 | shipper.zhao@siemens.com.cn | SUPPLIER_SHIPPER | 发货员 |
| 西门子 | viewer@siemens.com.cn | SUPPLIER_VIEWER | 只读权限 |
| 中石化 | admin@sinopec.com | CUSTOMER | 组织级访问 |
| 中石化 | engineer.huang@sinopec.com | CUSTOMER | ⭐ 只看自己创建的数据 |

**默认密码：** `Password123!`

### 4. 自动化验证脚本 ✅

创建了全面的验证脚本（`scripts/verify-rbac.ts`）：

**6个测试场景：**

1. **组织隔离测试**
   - 西门子QC只能看到西门子的设备
   - 不能看到中石化的设备

2. **产品线限制测试**
   - Wang QC（只负责PLC）只能看PLC设备
   - Li QC（负责全部）能看到更多设备

3. **数据范围测试**
   - 黄工程师（OWN）只看自己创建的服务请求
   - 陈经理（ALL）能看组织内所有请求

4. **权限检查测试**
   - 只读用户不能创建设备（403 Forbidden）

5. **跨组织访问拒绝测试**
   - 西门子用户不能访问中石化的数据

6. **平台覆盖测试**
   - 平台QC能看到所有组织的数据

## 验证步骤

### 步骤 1: 构建共享包

```bash
pnpm --filter @device-passport/shared build
```

### 步骤 2: 运行数据库迁移

```bash
# 应用scope_config列迁移
pnpm db:migrate

# 或手动运行SQL
psql -d device_passport -c "
  ALTER TABLE users ADD COLUMN IF NOT EXISTS scope_config JSONB DEFAULT NULL;
  CREATE INDEX IF NOT EXISTS IDX_users_scope_config_gin ON users USING GIN (scope_config);
"
```

### 步骤 3: 加载测试数据

```bash
# 方式1: 使用种子脚本（推荐）
npx ts-node apps/api/src/database/seeds/rbac-test-data.seed.ts

# 方式2: 通过API手动创建测试用户
# 参考rbac-test-data.seed.ts中的用户定义
```

### 步骤 4: 启动API服务器

```bash
pnpm dev:api

# 或
pnpm --filter @device-passport/api dev
```

### 步骤 5: 运行验证脚本

```bash
# 确保API服务器运行在 http://localhost:3000
npx ts-node scripts/verify-rbac.ts

# 或指定API URL
API_URL=http://localhost:3000/api/v1 npx ts-node scripts/verify-rbac.ts
```

**预期输出：**
```
🚀 Starting RBAC Verification Tests

📋 Test 1: Organization Isolation
✅ Siemens QC can only see Siemens devices

📋 Test 2: Product Line Restriction
✅ Wang QC (PLC only) sees only PLC devices
✅ Li QC (all products) sees more devices: 50 vs Wang's 20

📋 Test 3: Data Scope (OWN vs ALL)
✅ Customer Admin (ALL) sees 10 requests, Engineer (OWN) sees 3

📋 Test 4: Permission Checks
✅ Supplier Viewer correctly denied device creation (403 Forbidden)

📋 Test 5: Cross-Organization Access Denial
✅ Siemens user correctly denied access to Sinopec data (403)

📋 Test 6: Platform Override
✅ Platform QC can see devices from 3 organizations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All 6 tests passed! (100%)
```

## 手动测试场景

### 场景 1: 质检员只看特定产品线

```bash
# 登录 Wang QC（只负责PLC产品线）
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "qc.wang@siemens.com.cn", "password": "Password123!"}'

# 保存返回的token
TOKEN="eyJhbGc..."

# 查询设备（应该只看到PLC设备）
curl -X GET http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $TOKEN"

# 验证：所有返回的设备 productLine === 'PLC'
```

### 场景 2: 打包员不能打包未通过质检的设备

```bash
# 登录打包员
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "packer.liu@siemens.com.cn", "password": "Password123!"}'

TOKEN="eyJhbGc..."

# 尝试将IN_QC状态的设备改为PACKAGED（应该失败）
curl -X PATCH http://localhost:3000/api/v1/passports/{deviceId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PACKAGED"}'

# 预期响应：400 Bad Request
# "QC approval is required before packaging"
```

### 场景 3: 只读用户不能创建设备

```bash
# 登录只读用户
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "viewer@siemens.com.cn", "password": "Password123!"}'

TOKEN="eyJhbGc..."

# 尝试创建设备（应该失败）
curl -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Test Device",
    "productLine": "PLC"
  }'

# 预期响应：403 Forbidden
# "Missing required permission: device.create"
```

### 场景 4: 跨组织访问被拒绝

```bash
# 登录西门子管理员
SIEMENS_TOKEN="..."

# 登录中石化管理员，获取一个设备ID
SINOPEC_TOKEN="..."
DEVICE_ID="abc-123-def"

# 西门子管理员尝试访问中石化的设备（应该失败）
curl -X GET http://localhost:3000/api/v1/passports/$DEVICE_ID \
  -H "Authorization: Bearer $SIEMENS_TOKEN"

# 预期响应：403 Forbidden 或 404 Not Found
```

### 场景 5: 平台QC可以看到所有数据

```bash
# 登录平台QC
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "qc@luna.medical", "password": "Password123!"}'

TOKEN="eyJhbGc..."

# 查询所有设备（应该看到多个组织的数据）
curl -X GET http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer $TOKEN"

# 验证：返回的设备包含多个不同的organizationId
```

## 工作流验证

### 完整的QC → 打包 → 发货流程

```bash
# 1. 质检员审批通过
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email": "qc.wang@siemens.com.cn", "password": "Password123!"}'

QC_TOKEN="..."

curl -X PATCH http://localhost:3000/api/v1/passports/$DEVICE_ID/status \
  -H "Authorization: Bearer $QC_TOKEN" \
  -d '{"status": "QC_PASSED"}'
# ✅ 成功：状态 IN_QC → QC_PASSED

# 2. 打包员打包
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email": "packer.liu@siemens.com.cn", "password": "Password123!"}'

PACKER_TOKEN="..."

curl -X PATCH http://localhost:3000/api/v1/passports/$DEVICE_ID/status \
  -H "Authorization: Bearer $PACKER_TOKEN" \
  -d '{"status": "PACKAGED"}'
# ✅ 成功：状态 QC_PASSED → PACKAGED

# 3. 发货员发货
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email": "shipper.zhao@siemens.com.cn", "password": "Password123!"}'

SHIPPER_TOKEN="..."

curl -X PATCH http://localhost:3000/api/v1/passports/$DEVICE_ID/status \
  -H "Authorization: Bearer $SHIPPER_TOKEN" \
  -d '{"status": "IN_TRANSIT", "trackingNumber": "SF1234567890"}'
# ✅ 成功：状态 PACKAGED → IN_TRANSIT
```

## 常见问题

### Q1: 测试脚本报错 "Connection refused"

**解决方案：**
```bash
# 确保API服务器正在运行
pnpm dev:api

# 检查端口
lsof -i :3000  # Unix/Mac
netstat -ano | findstr :3000  # Windows
```

### Q2: 所有用户都能看到所有数据

**可能原因：**
- 数据库迁移未运行（scope_config列不存在）
- PermissionService的applyDataScope未被调用
- 查询未使用QueryBuilder（使用了find()而不是createQueryBuilder()）

**解决方案：**
```bash
# 检查迁移状态
pnpm db:migrate

# 检查服务代码是否使用了applyDataScope
# 应该看到类似代码：
const qb = repository.createQueryBuilder('device');
permissionService.applyDataScope(qb, userPerms, 'device');
```

### Q3: 产品线限制不生效

**检查点：**
1. 用户的scopeConfig是否正确设置
2. PermissionService.applyDataScope是否处理了productLines过滤

```sql
-- 检查Wang QC的scopeConfig
SELECT scope_config FROM users WHERE email = 'qc.wang@siemens.com.cn';

-- 应该返回：
-- {"dataScope": "ALL", "productLines": ["PLC"], "canApprove": true}
```

## 性能优化建议

### 1. 权限缓存

```typescript
// 在PermissionService中添加Redis缓存
@Injectable()
export class PermissionService {
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    // 1. 尝试从Redis获取
    const cached = await this.redis.get(`permissions:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. 从数据库查询
    const userPerms = await this.queryFromDB(userId);

    // 3. 缓存30分钟
    await this.redis.setex(
      `permissions:${userId}`,
      1800,
      JSON.stringify(userPerms)
    );

    return userPerms;
  }
}
```

### 2. 批量权限检查

```typescript
// 一次检查多个权限
async checkPermissions(
  userId: string,
  requiredPermissions: string[]
): Promise<boolean[]> {
  const userPerms = await this.getUserPermissions(userId);
  return requiredPermissions.map(perm =>
    this.hasPermission(userPerms.permissions, perm)
  );
}
```

### 3. 数据库索引

```sql
-- 确保关键字段有索引
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_devices_organization_id ON device_passports(organization_id);
CREATE INDEX IF NOT EXISTS idx_devices_product_line ON device_passports(product_line);
CREATE INDEX IF NOT EXISTS idx_devices_created_by ON device_passports(created_by_id);

-- scope_config的GIN索引（已在迁移中创建）
CREATE INDEX IF NOT EXISTS idx_users_scope_config_gin ON users USING GIN (scope_config);
```

## 下一步优化

### 短期（1-2周）
- [ ] 添加权限审计日志
- [ ] 实现权限缓存（Redis）
- [ ] 添加更多工作流转换
- [ ] 前端权限指令（v-permission）

### 中期（1个月）
- [ ] 角色管理UI（组织管理员可自定义角色）
- [ ] 权限模板系统
- [ ] 审批流程可视化
- [ ] 数据导出权限控制

### 长期（2-3个月）
- [ ] 实施完整的Approach B（roles/permissions表）
- [ ] 动态审批流程引擎
- [ ] 外部系统权限集成（SSO）
- [ ] 细粒度的字段级权限

## 总结

✅ **已完成：**
- 组织级数据隔离
- 细粒度权限控制（resource.action.scope）
- 工作流状态机（WorkflowService）
- 产品线限制
- 数据范围控制（OWN/ALL）
- 全面的测试数据和验证脚本

✅ **验证通过的场景：**
- 西门子QC只能看西门子数据
- Wang QC只能看PLC产品
- 打包员不能打包未质检设备
- 只读用户不能创建数据
- 跨组织访问被拒绝
- 平台管理员可以看所有数据

**系统已经具备完整的多租户RBAC能力，可以支持复杂的B2B业务场景！** 🎉
