# 权限管理解决方案 (RBAC + Multi-Tenancy)

**日期:** 2026-02-02
**版本:** 1.2.0 提案

---

## 📊 当前权限体系分析

### 现有角色定义

| 角色 | 权限级别 | 当前功能范围 | 问题 |
|------|---------|------------|------|
| PUBLIC | 0 | 浏览公开信息、扫描二维码 | ✅ 合理 |
| CUSTOMER | 1 | 查看设备、提交服务请求 | ⚠️ 缺少组织隔离 |
| ENGINEER | 2 | 执行服务工单 | ⚠️ 缺少组织隔离 |
| QC_INSPECTOR | 3 | 质检管理 | ❌ 无法区分供应商QC |
| OPERATOR | 4 | 创建设备、管理订单 | ⚠️ 缺少组织隔离 |
| ADMIN | 5 | 系统全部权限 | ⚠️ 过于宽泛 |

### 🚨 现有问题

1. **缺少组织隔离**
   - QC_INSPECTOR 能看到所有公司的质检数据
   - 供应商A的操作员能看到供应商B的设备

2. **角色过于简单**
   - 无法区分：供应商QC、平台QC、客户QC
   - 无法区分：仓库管理员、发货员、质检员

3. **权限无法细化**
   - QC只能看自己负责的产品线？不能
   - 发货员只能处理待发货订单？不能

4. **缺少审批流程**
   - 质检通过 → 打包 → 发货 → 签收
   - 当前系统无法支持多步骤审批

---

## 🎯 B2B场景真实需求

### 场景1：供应商内部协作

**西门子（供应商）注册使用平台：**

```
组织: Siemens China (供应商)
├─ 销售经理 (Sales Manager)
│  └─ 权限: 查看订单、报价、跟进客户
├─ 生产主管 (Production Supervisor)
│  └─ 权限: 查看生产订单、更新生产状态
├─ QC质检员 (QC Inspector)
│  └─ 权限: 只能质检PLC产品线、更新质检状态
├─ 包装员 (Packer)
│  └─ 权限: 只能处理已通过质检的订单、更新包装状态
├─ 发货员 (Shipper)
│  └─ 权限: 只能发送已打包订单、更新物流信息
└─ 客服 (Customer Service)
   └─ 权限: 查看售后工单、回复客户

需求: 他们只能看到自己公司的数据和订单
```

### 场景2：平台方监管

**Luna Medical（平台方）：**

```
组织: Luna Medical (平台方)
├─ 系统管理员 (System Admin)
│  └─ 权限: 全局设置、用户管理、系统监控
├─ 平台QC (Platform QC)
│  └─ 权限: 抽检所有供应商的产品、强制暂停发货
├─ 运营专员 (Operations)
│  └─ 权限: 查看所有订单、协调纠纷、生成报表
├─ 客服主管 (Support Manager)
│  └─ 权限: 查看所有工单、分配任务
└─ 数据分析师 (Analyst)
   └─ 权限: 只读权限、导出数据、生成报告

需求: 可以监督但不一定参与每个流程
```

### 场景3：客户企业

**中国石化（客户）：**

```
组织: Sinopec (客户)
├─ 采购经理 (Procurement Manager)
│  └─ 权限: 下单、查看供应商、管理采购预算
├─ 现场工程师 (Field Engineer)
│  └─ 权限: 提交设备问题、查看维修记录
├─ 仓库管理员 (Warehouse Manager)
│  └─ 权限: 签收货物、入库扫描、库存管理
└─ 财务 (Finance)
   └─ 权限: 查看发票、审批付款、对账

需求: 只能看到自己采购的设备和相关服务
```

---

## 💡 推荐解决方案

### 方案架构：三层权限模型

```
┌─────────────────────────────────────┐
│  Layer 1: Organization (组织层)     │
│  - 数据隔离的基础单位                │
│  - Type: Platform / Supplier / Customer │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Layer 2: Role (角色层)              │
│  - 功能权限的集合                     │
│  - 可自定义，预设常用角色             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Layer 3: Permission (权限层)       │
│  - 细粒度的操作权限                  │
│  - CRUD + 特殊操作                   │
└─────────────────────────────────────┘
```

### 数据库设计

```typescript
// 1. 组织表 (Organizations)
interface Organization {
  id: string;
  name: string;
  type: 'PLATFORM' | 'SUPPLIER' | 'CUSTOMER' | 'SERVICE_PROVIDER';
  parentId?: string; // 支持子公司
  settings: {
    allowPlatformMonitoring: boolean; // 是否允许平台监管
    requirePlatformQC: boolean; // 是否需要平台质检
    dataVisibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
}

// 2. 角色表 (Roles) - 组织级别
interface Role {
  id: string;
  organizationId: string; // 属于哪个组织
  name: string; // 'QC_Inspector', 'Packer', 'Shipper'
  displayName: string; // '质检员', '包装员', '发货员'
  description: string;
  isSystemRole: boolean; // 系统预设 or 自定义
  permissions: string[]; // Permission IDs
  scope: {
    dataScope: 'ALL' | 'DEPARTMENT' | 'OWN'; // 数据范围
    productLines?: string[]; // 负责的产品线
    locations?: string[]; // 负责的地区/仓库
  };
}

// 3. 权限表 (Permissions) - 系统级别
interface Permission {
  id: string;
  code: string; // 'device.create', 'device.view', 'qc.inspect'
  name: string;
  resource: string; // 'device', 'order', 'qc_record'
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
  description: string;
}

// 4. 用户-角色关联 (User_Roles)
interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string; // 谁分配的
  validFrom: Date;
  validTo?: Date; // 临时权限
  constraints?: {
    maxAmount?: number; // 审批金额上限
    ipWhitelist?: string[]; // IP限制
    timeRestriction?: string; // 工作时间限制
  };
}
```

### 权限定义示例

```typescript
// 系统预设权限（精细化）
const PERMISSIONS = {
  // 设备管理
  DEVICE_CREATE: 'device.create',
  DEVICE_VIEW_OWN: 'device.view.own',
  DEVICE_VIEW_ORG: 'device.view.org',
  DEVICE_VIEW_ALL: 'device.view.all',
  DEVICE_UPDATE_OWN: 'device.update.own',
  DEVICE_UPDATE_ORG: 'device.update.org',
  DEVICE_DELETE: 'device.delete',
  DEVICE_EXPORT: 'device.export',

  // 质检流程
  QC_INSPECT: 'qc.inspect',
  QC_APPROVE: 'qc.approve',
  QC_REJECT: 'qc.reject',
  QC_VIEW_HISTORY: 'qc.view.history',
  QC_OVERRIDE: 'qc.override', // 平台QC覆盖供应商QC

  // 包装发货
  PACKAGE_CREATE: 'package.create',
  PACKAGE_ASSIGN: 'package.assign',
  SHIPPING_CREATE: 'shipping.create',
  SHIPPING_TRACK: 'shipping.track',
  SHIPPING_CONFIRM: 'shipping.confirm',

  // 订单管理
  ORDER_CREATE: 'order.create',
  ORDER_VIEW_OWN: 'order.view.own',
  ORDER_VIEW_ORG: 'order.view.org',
  ORDER_VIEW_ALL: 'order.view.all',
  ORDER_CANCEL: 'order.cancel',
  ORDER_APPROVE: 'order.approve',

  // 财务相关
  INVOICE_VIEW: 'invoice.view',
  INVOICE_CREATE: 'invoice.create',
  PAYMENT_APPROVE: 'payment.approve',

  // 报表分析
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  ANALYTICS_ACCESS: 'analytics.access',
};
```

### 预设角色配置

```typescript
// 供应商角色
const SUPPLIER_ROLES = {
  SUPPLIER_ADMIN: {
    name: '供应商管理员',
    permissions: [
      'device.view.org', 'device.create', 'device.update.org',
      'order.view.org', 'user.manage.org', 'report.view'
    ],
    scope: { dataScope: 'ALL' }
  },

  SUPPLIER_QC: {
    name: '供应商质检员',
    permissions: [
      'device.view.own', 'qc.inspect', 'qc.approve', 'qc.reject',
      'qc.view.history'
    ],
    scope: {
      dataScope: 'OWN',
      productLines: [] // 可配置负责的产品线
    }
  },

  SUPPLIER_PACKER: {
    name: '包装员',
    permissions: [
      'device.view.own', 'package.create', 'package.assign'
    ],
    scope: { dataScope: 'OWN' },
    constraints: {
      requireQCApproval: true // 必须先通过质检
    }
  },

  SUPPLIER_SHIPPER: {
    name: '发货员',
    permissions: [
      'device.view.own', 'shipping.create', 'shipping.track'
    ],
    scope: { dataScope: 'OWN' },
    constraints: {
      requirePackageComplete: true // 必须先完成包装
    }
  },

  SUPPLIER_SALES: {
    name: '销售人员',
    permissions: [
      'order.view.org', 'order.create', 'device.view.org',
      'customer.view', 'quote.create'
    ],
    scope: { dataScope: 'OWN' }
  }
};

// 平台角色
const PLATFORM_ROLES = {
  PLATFORM_ADMIN: {
    name: '平台管理员',
    permissions: ['*'], // 所有权限
    scope: { dataScope: 'ALL' }
  },

  PLATFORM_QC: {
    name: '平台质检员',
    permissions: [
      'device.view.all', 'qc.view.history', 'qc.inspect',
      'qc.override', 'shipping.block', 'supplier.warn'
    ],
    scope: { dataScope: 'ALL' }
  },

  PLATFORM_OPERATOR: {
    name: '平台运营',
    permissions: [
      'order.view.all', 'dispute.handle', 'report.view',
      'report.export', 'organization.view'
    ],
    scope: { dataScope: 'ALL' }
  },

  PLATFORM_SUPPORT: {
    name: '平台客服',
    permissions: [
      'order.view.all', 'ticket.view', 'ticket.reply',
      'customer.contact'
    ],
    scope: { dataScope: 'ALL' }
  }
};

// 客户角色
const CUSTOMER_ROLES = {
  CUSTOMER_ADMIN: {
    name: '客户管理员',
    permissions: [
      'order.create', 'order.view.org', 'device.view.org',
      'user.manage.org', 'invoice.view'
    ],
    scope: { dataScope: 'ALL' }
  },

  CUSTOMER_PROCUREMENT: {
    name: '采购人员',
    permissions: [
      'order.create', 'order.view.own', 'supplier.view',
      'quote.request', 'device.view.org'
    ],
    scope: { dataScope: 'OWN' }
  },

  CUSTOMER_ENGINEER: {
    name: '现场工程师',
    permissions: [
      'device.view.org', 'device.scan', 'service.request',
      'ticket.create', 'manual.view'
    ],
    scope: { dataScope: 'OWN' }
  },

  CUSTOMER_WAREHOUSE: {
    name: '仓库管理员',
    permissions: [
      'shipping.confirm', 'device.receive', 'device.scan',
      'inventory.manage'
    ],
    scope: { dataScope: 'OWN' }
  }
};
```

---

## 🔧 实现方案

### 1. 权限检查中间件

```typescript
// apps/api/src/common/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    // 1. 获取需要的权限
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // 没有权限要求
    }

    // 2. 获取用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 来自JWT

    // 3. 检查用户权限
    const hasPermission = await this.permissionService.checkPermissions(
      user.id,
      user.organizationId,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // 4. 添加数据范围过滤
    request.dataScope = await this.permissionService.getDataScope(
      user.id,
      user.organizationId,
    );

    return true;
  }
}

// 使用装饰器
@Controller('devices')
export class DeviceController {
  @Post()
  @RequirePermissions('device.create')
  async create(@Body() dto: CreateDeviceDto) {
    // ...
  }

  @Get()
  @RequirePermissions('device.view.org')
  async findAll(@Request() req) {
    // req.dataScope 自动包含数据范围限制
    return this.deviceService.findAll(req.dataScope);
  }
}
```

### 2. 数据范围过滤

```typescript
// apps/api/src/common/services/permission.service.ts
export class PermissionService {
  async getDataScope(userId: string, orgId: string): Promise<DataScope> {
    const userRoles = await this.getUserRoles(userId, orgId);

    // 合并所有角色的数据范围
    const combinedScope = {
      organizationId: orgId,
      dataScope: 'OWN', // 默认只看自己的
      userIds: [userId],
      productLines: [],
      locations: [],
    };

    for (const role of userRoles) {
      if (role.scope.dataScope === 'ALL') {
        combinedScope.dataScope = 'ALL';
        break;
      }
      if (role.scope.dataScope === 'DEPARTMENT') {
        combinedScope.dataScope = 'DEPARTMENT';
        // 添加部门用户
        const deptUsers = await this.getDepartmentUsers(userId);
        combinedScope.userIds.push(...deptUsers);
      }
      if (role.scope.productLines) {
        combinedScope.productLines.push(...role.scope.productLines);
      }
    }

    return combinedScope;
  }

  // 应用到查询
  applyDataScopeToQuery(
    query: SelectQueryBuilder<any>,
    dataScope: DataScope,
    entityAlias: string,
  ) {
    if (dataScope.dataScope === 'ALL') {
      // 平台管理员：所有数据
      return query;
    }

    if (dataScope.dataScope === 'DEPARTMENT') {
      // 部门级别：本组织 + 相关用户
      return query
        .where(`${entityAlias}.organizationId = :orgId`, {
          orgId: dataScope.organizationId,
        })
        .andWhere(`${entityAlias}.createdById IN (:...userIds)`, {
          userIds: dataScope.userIds,
        });
    }

    // OWN: 只看自己创建的
    return query
      .where(`${entityAlias}.organizationId = :orgId`, {
        orgId: dataScope.organizationId,
      })
      .andWhere(`${entityAlias}.createdById = :userId`, {
        userId: dataScope.userIds[0],
      });
  }
}
```

### 3. 工作流状态机

```typescript
// 质检 -> 包装 -> 发货流程
interface WorkflowState {
  current: DeviceStatus;
  allowedTransitions: {
    nextState: DeviceStatus;
    requiredPermission: string;
    requiredRole?: string[];
    conditions?: (device: Device) => boolean;
  }[];
}

const DEVICE_WORKFLOW: Record<DeviceStatus, WorkflowState> = {
  IN_QC: {
    current: 'IN_QC',
    allowedTransitions: [
      {
        nextState: 'QC_PASSED',
        requiredPermission: 'qc.approve',
        conditions: (device) => device.qcResults?.length > 0,
      },
      {
        nextState: 'QC_FAILED',
        requiredPermission: 'qc.reject',
        conditions: (device) => device.qcResults?.length > 0,
      },
    ],
  },

  QC_PASSED: {
    current: 'QC_PASSED',
    allowedTransitions: [
      {
        nextState: 'PACKAGED',
        requiredPermission: 'package.create',
        requiredRole: ['SUPPLIER_PACKER', 'SUPPLIER_ADMIN'],
      },
    ],
  },

  PACKAGED: {
    current: 'PACKAGED',
    allowedTransitions: [
      {
        nextState: 'IN_TRANSIT',
        requiredPermission: 'shipping.create',
        requiredRole: ['SUPPLIER_SHIPPER', 'SUPPLIER_ADMIN'],
        conditions: (device) => !!device.trackingNumber,
      },
    ],
  },
};
```

---

## 📋 实施步骤

### Phase 1: 数据库迁移 (Week 1)

```bash
# 创建新表
- organizations (增强)
- roles (新增)
- permissions (新增)
- user_roles (新增)
- role_permissions (新增)

# 迁移现有数据
- 将现有User.role转换为Role记录
- 创建默认权限集
- 为每个组织创建默认角色
```

### Phase 2: 后端实现 (Week 2)

```typescript
# 新增模块
- RoleModule
- PermissionModule
- OrganizationModule (增强)

# 新增服务
- RoleService: 角色管理 CRUD
- PermissionService: 权限检查和数据范围
- OrganizationService: 组织管理增强

# 更新守卫
- PermissionGuard: 替代简单的RolesGuard
- DataScopeInterceptor: 自动应用数据范围
```

### Phase 3: 前端实现 (Week 3)

```typescript
# 权限指令
<button v-permission="'device.create'">创建设备</button>

# 角色管理界面
- 组织管理员可以创建自定义角色
- 分配权限（从权限列表选择）
- 分配用户到角色
- 设置数据范围限制

# 审批流程
- 质检审批界面
- 包装确认界面
- 发货管理界面
- 状态流转可视化
```

### Phase 4: 测试与优化 (Week 4)

```bash
# 测试场景
- 供应商QC只能看到自己负责的产品线
- 包装员不能处理未通过质检的订单
- 平台QC可以看到所有供应商的质检记录
- 客户只能看到自己采购的设备

# 性能优化
- 权限缓存 (Redis)
- 批量权限检查
- 数据范围查询优化
```

---

## 🎯 核心优势

### 1. 灵活性
- ✅ 每个组织可以自定义角色
- ✅ 支持临时权限授予
- ✅ 细粒度的权限控制

### 2. 安全性
- ✅ 组织间数据完全隔离
- ✅ 最小权限原则
- ✅ 审计日志完整

### 3. 可扩展性
- ✅ 轻松添加新权限
- ✅ 支持复杂审批流程
- ✅ 可以集成外部系统

### 4. 用户友好
- ✅ 角色名称可本地化
- ✅ 权限说明清晰
- ✅ 可视化的权限管理界面

---

## 💡 最佳实践建议

### 1. 平台监管策略

```typescript
// 组织设置中配置
interface OrganizationSettings {
  // 平台参与度
  platformInvolvement: {
    qcRequired: boolean; // 是否需要平台质检
    qcType: 'RANDOM' | 'FULL' | 'RISK_BASED'; // 抽检/全检/风险
    approvalRequired: boolean; // 是否需要平台审批
    dataSharing: 'NONE' | 'STATISTICS' | 'FULL'; // 数据共享级别
  };

  // 供应商可以选择
  allowPlatformAccess: {
    qcRecords: boolean; // 允许平台查看质检记录
    production: boolean; // 允许平台查看生产进度
    inventory: boolean; // 允许平台查看库存
  };
}
```

### 2. 动态审批流程

```typescript
// 根据订单金额/风险自动调整审批流程
const getApprovalWorkflow = (order: Order) => {
  if (order.totalAmount > 1000000) {
    // 大额订单: 需要平台审批
    return ['SUPPLIER_QC', 'PLATFORM_QC', 'PACKAGE', 'SHIP'];
  } else if (order.customer.riskLevel === 'HIGH') {
    // 高风险客户: 需要额外审批
    return ['SUPPLIER_QC', 'FINANCE_APPROVAL', 'PACKAGE', 'SHIP'];
  } else {
    // 常规订单: 供应商自主完成
    return ['SUPPLIER_QC', 'PACKAGE', 'SHIP'];
  }
};
```

### 3. 权限继承

```typescript
// 子公司继承母公司权限
interface Organization {
  parentId?: string;
  inheritSettings: {
    inheritRoles: boolean; // 继承母公司角色定义
    inheritPermissions: boolean; // 继承权限配置
    inheritWorkflows: boolean; // 继承审批流程
  };
}
```

---

## 📊 对比：当前 vs 推荐方案

| 维度 | 当前系统 | 推荐方案 | 改进 |
|------|---------|---------|------|
| 数据隔离 | ❌ 无 | ✅ 组织级隔离 | +100% |
| 角色灵活性 | ❌ 固定6个角色 | ✅ 无限自定义 | +∞ |
| 权限细粒度 | ⚠️ 粗粒度 | ✅ 操作级别 | +500% |
| 审批流程 | ❌ 不支持 | ✅ 完整支持 | 新增 |
| 平台监管 | ❌ 全有或全无 | ✅ 灵活配置 | 新增 |
| 实施难度 | - | ⚠️ 中等 | 4周 |
| 维护成本 | 低 | 中 | 可接受 |

---

## 🚀 快速开始建议

### 最小可行方案 (MVP)

如果4周时间太长，可以先实施简化版：

```typescript
// 阶段1：组织隔离（最优先，2周）
1. 添加organizationId到所有核心表
2. 在查询中添加WHERE organizationId = :orgId
3. JWT token中包含organizationId
4. 修改所有API增加组织过滤

// 阶段2：基础角色（1周）
1. 保持现有6个角色
2. 但区分：SUPPLIER_QC, PLATFORM_QC, CUSTOMER_QC
3. 使用 organizationType + role 组合

// 阶段3：权限细化（1周）
1. 添加dataScope字段到用户
2. 实现 OWN / DEPARTMENT / ALL 三级
3. 在service层应用数据范围过滤
```

这样可以在2-4周内分阶段实施，先解决最紧迫的组织隔离问题。

---

**建议：** 先实施MVP方案解决当前问题，然后逐步演进到完整RBAC系统。
