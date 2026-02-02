# RBAC 实施指南 - 基于现有系统

**当前系统状态:** 已有 Organization + UserRole 基础
**目标:** 实现组织隔离 + 细粒度权限

---

## 📊 当前系统结构分析

### 已有资源 ✅

```typescript
// 1. Organization 表
✅ id, name, code, type (INTERNAL/SUPPLIER/CUSTOMER/SERVICE_PARTNER)
✅ address, phone, email, contactPerson
✅ isActive, createdAt, updatedAt

// 2. User 表
✅ id, email, name, password
✅ role (PUBLIC/CUSTOMER/ENGINEER/QC_INSPECTOR/OPERATOR/ADMIN)
✅ organizationId (外键到Organization)
✅ isActive, lastLoginAt

// 3. OrganizationType 枚举
✅ INTERNAL (平台方)
✅ SUPPLIER (供应商)
✅ CUSTOMER (客户)
✅ SERVICE_PARTNER (服务商)
```

### 缺失部分 ❌

```
❌ 组织间数据隔离机制
❌ 细粒度权限定义
❌ 角色-权限映射表
❌ 数据范围 (dataScope)
❌ 审批工作流
```

---

## 🎯 实际应用场景示例

### 场景：西门子（供应商）使用平台

#### 步骤1：组织注册

```json
{
  "organization": {
    "name": "Siemens China",
    "code": "SIE",
    "type": "SUPPLIER",
    "address": "北京市朝阳区...",
    "contactPerson": "张经理"
  }
}
```

#### 步骤2：创建用户并分配角色

```json
// 用户1：供应商管理员
{
  "email": "admin@siemens.com.cn",
  "name": "张经理",
  "role": "SUPPLIER_ADMIN", // 新角色类型
  "organizationId": "siemens-org-id",
  "permissions": {
    "dataScope": "ALL_IN_ORG", // 能看到组织内所有数据
    "productLines": ["*"], // 所有产品线
    "canManageUsers": true
  }
}

// 用户2：质检员（只负责PLC产品线）
{
  "email": "qc.wang@siemens.com.cn",
  "name": "王质检",
  "role": "SUPPLIER_QC",
  "organizationId": "siemens-org-id",
  "permissions": {
    "dataScope": "OWN", // 只看自己处理的
    "productLines": ["PLC"], // 只能质检PLC
    "canApprove": true,
    "canReject": true
  }
}

// 用户3：包装员
{
  "email": "pack.li@siemens.com.cn",
  "name": "李包装",
  "role": "SUPPLIER_PACKER",
  "organizationId": "siemens-org-id",
  "permissions": {
    "dataScope": "OWN",
    "productLines": ["*"],
    "requireQCApproval": true // 必须先通过质检
  }
}

// 用户4：发货员
{
  "email": "ship.zhao@siemens.com.cn",
  "name": "赵发货",
  "role": "SUPPLIER_SHIPPER",
  "organizationId": "siemens-org-id",
  "permissions": {
    "dataScope": "OWN",
    "requirePackageComplete": true // 必须先完成包装
  }
}
```

#### 步骤3：工作流程示例

```
订单: DP-SIE-2602-PLC-CN-000123

1. [生产完成] → 状态: PRODUCED
   ↓

2. [王质检登录] → 只能看到PLC产品
   - 可以看到: DP-SIE-2602-PLC-CN-000123 ✅
   - 看不到: DP-SIE-2602-MOT-CN-000456 (MOT不是他负责的) ❌

   [王质检检查] → 点击"通过质检"
   ↓
   状态: QC_PASSED
   ↓

3. [李包装登录] → 看到待包装列表
   - 必须是 QC_PASSED 状态才能包装
   - 只能看到自己组织的订单

   [李包装打包] → 点击"完成包装"
   ↓
   状态: PACKAGED
   ↓

4. [赵发货登录] → 看到待发货列表
   - 必须是 PACKAGED 状态才能发货
   - 填写物流信息

   [赵发货确认] → 点击"发货"
   ↓
   状态: IN_TRANSIT
   ↓

5. [平台监管] - 可选
   如果设置了 requirePlatformQC: true
   └─> [平台QC抽检] → 可以看到所有供应商的发货
       如发现问题 → 可以"暂停发货"
```

---

## 🔧 最小化改造方案

### 方案A：扩展现有 Role 枚举（最简单，1周）

```typescript
// packages/shared/src/enums/index.ts
export enum UserRole {
  // 现有角色
  PUBLIC = 'PUBLIC',
  CUSTOMER = 'CUSTOMER',
  ENGINEER = 'ENGINEER',
  QC_INSPECTOR = 'QC_INSPECTOR',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',

  // 新增：供应商角色
  SUPPLIER_ADMIN = 'SUPPLIER_ADMIN',
  SUPPLIER_QC = 'SUPPLIER_QC',
  SUPPLIER_PACKER = 'SUPPLIER_PACKER',
  SUPPLIER_SHIPPER = 'SUPPLIER_SHIPPER',
  SUPPLIER_SALES = 'SUPPLIER_SALES',

  // 新增：平台角色
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_QC = 'PLATFORM_QC',
  PLATFORM_OPERATOR = 'PLATFORM_OPERATOR',
  PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',

  // 新增：客户角色
  CUSTOMER_ADMIN = 'CUSTOMER_ADMIN',
  CUSTOMER_PROCUREMENT = 'CUSTOMER_PROCUREMENT',
  CUSTOMER_ENGINEER = 'CUSTOMER_ENGINEER',
  CUSTOMER_WAREHOUSE = 'CUSTOMER_WAREHOUSE',
}

// 添加角色配置
export const ROLE_CONFIG: Record<UserRole, RoleDefinition> = {
  SUPPLIER_QC: {
    name: '供应商质检员',
    organizationType: 'SUPPLIER',
    permissions: ['device.view.own', 'qc.inspect', 'qc.approve'],
    dataScope: 'OWN',
    description: '只能查看和质检本组织的设备，限定产品线范围',
  },
  SUPPLIER_PACKER: {
    name: '包装员',
    organizationType: 'SUPPLIER',
    permissions: ['device.view.own', 'package.create'],
    dataScope: 'OWN',
    constraints: {
      requireQCApproval: true,
    },
  },
  // ... 其他角色
};
```

#### 优点
- ✅ 改动最小
- ✅ 快速实施（1周）
- ✅ 向后兼容

#### 缺点
- ⚠️ 角色数量爆炸（可能有50+角色）
- ⚠️ 无法自定义角色
- ⚠️ 不够灵活

---

### 方案B：添加 Role 表（推荐，2-3周）

```sql
-- 1. 创建角色表
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  permissions JSONB, -- 权限列表
  data_scope VARCHAR(20), -- 'ALL', 'DEPARTMENT', 'OWN'
  scope_config JSONB, -- 产品线、地区等限制
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 2. 创建用户-角色关联表
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  assigned_by UUID REFERENCES users(id),
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_to TIMESTAMP,
  constraints JSONB, -- 额外约束（金额上限等）
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id, organization_id)
);

-- 3. 保留 users.role 字段作为主角色（向后兼容）
-- ALTER TABLE users ADD COLUMN primary_role_id UUID REFERENCES roles(id);
```

#### Entity 定义

```typescript
// apps/api/src/database/entities/role.entity.ts
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string; // 'SUPPLIER_QC', 'PACKER'

  @Column({ name: 'display_name' })
  displayName: string; // '供应商质检员', '包装员'

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_system_role', default: false })
  isSystemRole: boolean; // 系统预设 vs 自定义

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @Column({ name: 'data_scope', default: 'OWN' })
  dataScope: 'ALL' | 'DEPARTMENT' | 'OWN';

  @Column({ type: 'jsonb', nullable: true, name: 'scope_config' })
  scopeConfig: {
    productLines?: string[];
    locations?: string[];
    departments?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// apps/api/src/database/entities/user-role.entity.ts
@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ name: 'valid_from', default: () => 'NOW()' })
  validFrom: Date;

  @Column({ name: 'valid_to', nullable: true })
  validTo: Date; // 临时权限

  @Column({ type: 'jsonb', nullable: true })
  constraints: {
    maxAmount?: number; // 审批金额上限
    ipWhitelist?: string[];
    timeRestriction?: string; // '09:00-18:00'
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

#### Service 实现

```typescript
// apps/api/src/modules/rbac/permission.service.ts
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private cacheManager: Cache,
  ) {}

  async getUserPermissions(
    userId: string,
    organizationId: string,
  ): Promise<UserPermissions> {
    // 1. 检查缓存
    const cacheKey = `permissions:${userId}:${organizationId}`;
    const cached = await this.cacheManager.get<UserPermissions>(cacheKey);
    if (cached) return cached;

    // 2. 查询用户的所有角色
    const userRoles = await this.userRoleRepo.find({
      where: {
        userId,
        organizationId,
        validFrom: LessThanOrEqual(new Date()),
        validTo: Or(IsNull(), MoreThan(new Date())),
      },
      relations: ['role'],
    });

    // 3. 合并所有角色的权限
    const allPermissions = new Set<string>();
    let dataScope: 'OWN' | 'DEPARTMENT' | 'ALL' = 'OWN';
    const scopeConfig = {
      productLines: new Set<string>(),
      locations: new Set<string>(),
    };

    for (const userRole of userRoles) {
      const role = userRole.role;

      // 合并权限
      role.permissions.forEach((p) => allPermissions.add(p));

      // 取最宽的数据范围
      if (role.dataScope === 'ALL') {
        dataScope = 'ALL';
      } else if (role.dataScope === 'DEPARTMENT' && dataScope === 'OWN') {
        dataScope = 'DEPARTMENT';
      }

      // 合并范围配置
      if (role.scopeConfig) {
        role.scopeConfig.productLines?.forEach((pl) =>
          scopeConfig.productLines.add(pl),
        );
        role.scopeConfig.locations?.forEach((loc) =>
          scopeConfig.locations.add(loc),
        );
      }
    }

    const result: UserPermissions = {
      userId,
      organizationId,
      permissions: Array.from(allPermissions),
      dataScope,
      scopeConfig: {
        productLines: Array.from(scopeConfig.productLines),
        locations: Array.from(scopeConfig.locations),
      },
      roles: userRoles.map((ur) => ur.role.name),
    };

    // 4. 缓存30分钟
    await this.cacheManager.set(cacheKey, result, { ttl: 1800 });

    return result;
  }

  async checkPermission(
    userId: string,
    organizationId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId, organizationId);

    // 检查是否有通配符权限
    if (userPerms.permissions.includes('*')) {
      return true;
    }

    // 检查精确匹配
    if (userPerms.permissions.includes(requiredPermission)) {
      return true;
    }

    // 检查通配符匹配 (device.* 匹配 device.create)
    const wildcardPermissions = userPerms.permissions.filter((p) =>
      p.endsWith('.*'),
    );
    for (const wildcardPerm of wildcardPermissions) {
      const prefix = wildcardPerm.slice(0, -2);
      if (requiredPermission.startsWith(prefix + '.')) {
        return true;
      }
    }

    return false;
  }

  // 应用数据范围到查询
  applyDataScope<T>(
    qb: SelectQueryBuilder<T>,
    userPerms: UserPermissions,
    alias: string,
  ): SelectQueryBuilder<T> {
    // 1. 始终限制组织
    qb.andWhere(`${alias}.organizationId = :orgId`, {
      orgId: userPerms.organizationId,
    });

    // 2. 根据数据范围添加过滤
    if (userPerms.dataScope === 'ALL') {
      // 全部数据，不额外过滤
    } else if (userPerms.dataScope === 'OWN') {
      // 只看自己的
      qb.andWhere(`${alias}.createdById = :userId`, {
        userId: userPerms.userId,
      });
    }

    // 3. 应用产品线限制
    if (
      userPerms.scopeConfig.productLines &&
      userPerms.scopeConfig.productLines.length > 0 &&
      !userPerms.scopeConfig.productLines.includes('*')
    ) {
      qb.andWhere(`${alias}.productLine IN (:...productLines)`, {
        productLines: userPerms.scopeConfig.productLines,
      });
    }

    return qb;
  }
}
```

#### Guard 实现

```typescript
// apps/api/src/common/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // 来自JWT

    // 检查所有必需权限
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionService.checkPermission(
        user.sub,
        user.organizationId,
        permission,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing required permission: ${permission}`,
        );
      }
    }

    // 添加用户权限到请求对象，供后续使用
    request.userPermissions = await this.permissionService.getUserPermissions(
      user.sub,
      user.organizationId,
    );

    return true;
  }
}

// 使用装饰器
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Controller 中使用
@Controller('devices')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DeviceController {
  @Post()
  @RequirePermissions('device.create')
  async create(@Request() req, @Body() dto: CreateDeviceDto) {
    // req.userPermissions 包含用户所有权限信息
    return this.deviceService.create(dto, req.userPermissions);
  }

  @Get()
  @RequirePermissions('device.view')
  async findAll(@Request() req, @Query() query: QueryDeviceDto) {
    // Service会自动应用数据范围过滤
    return this.deviceService.findAll(query, req.userPermissions);
  }
}
```

#### Service 中应用数据范围

```typescript
// apps/api/src/modules/passport/passport.service.ts
@Injectable()
export class PassportService {
  constructor(
    @InjectRepository(DevicePassport)
    private passportRepo: Repository<DevicePassport>,
    private permissionService: PermissionService,
  ) {}

  async findAll(
    query: QueryDeviceDto,
    userPermissions: UserPermissions,
  ): Promise<DevicePassport[]> {
    const qb = this.passportRepo
      .createQueryBuilder('passport')
      .leftJoinAndSelect('passport.organization', 'org');

    // 应用搜索条件
    if (query.search) {
      qb.andWhere(
        '(passport.deviceName LIKE :search OR passport.passportCode LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // 应用数据范围过滤
    this.permissionService.applyDataScope(qb, userPermissions, 'passport');

    // 分页
    qb.skip(query.offset || 0).take(query.limit || 20);

    return qb.getMany();
  }
}
```

---

## 📝 数据迁移脚本

```typescript
// apps/api/src/database/migrations/XXXX-create-rbac-tables.ts
export class CreateRBACTables1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 创建 roles 表
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_system_role',
            type: 'boolean',
            default: false,
          },
          {
            name: 'permissions',
            type: 'jsonb',
            default: "'[]'::jsonb",
          },
          {
            name: 'data_scope',
            type: 'varchar',
            length: '20',
            default: "'OWN'",
          },
          {
            name: 'scope_config',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // 2. 创建 user_roles 表
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'role_id',
            type: 'uuid',
          },
          {
            name: 'organization_id',
            type: 'uuid',
          },
          {
            name: 'assigned_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'valid_from',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'valid_to',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'constraints',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // 3. 创建外键
    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    // 4. 创建索引
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_ROLES_ORG',
        columnNames: ['organization_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_USER_ROLES_USER',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_USER_ROLES_ORG',
        columnNames: ['organization_id'],
      }),
    );

    // 5. 插入系统预设角色
    await queryRunner.query(`
      INSERT INTO roles (id, name, display_name, is_system_role, permissions, data_scope, description)
      VALUES
        (uuid_generate_v4(), 'SUPPLIER_ADMIN', '供应商管理员', true,
         '["device.*", "order.view.org", "user.manage.org"]'::jsonb, 'ALL',
         '供应商组织的管理员，可以管理组织内所有数据和用户'),

        (uuid_generate_v4(), 'SUPPLIER_QC', '供应商质检员', true,
         '["device.view.own", "qc.inspect", "qc.approve", "qc.reject"]'::jsonb, 'OWN',
         '负责质检工作，只能查看和处理分配给自己的设备'),

        (uuid_generate_v4(), 'SUPPLIER_PACKER', '包装员', true,
         '["device.view.own", "package.create"]'::jsonb, 'OWN',
         '负责包装工作，只能处理已通过质检的设备'),

        (uuid_generate_v4(), 'SUPPLIER_SHIPPER', '发货员', true,
         '["device.view.own", "shipping.create", "shipping.track"]'::jsonb, 'OWN',
         '负责发货工作，只能处理已完成包装的设备');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('roles');
  }
}
```

---

## 🚀 实施建议

### 短期方案（1周）- 快速见效
1. 扩展 UserRole 枚举（方案A）
2. 在查询中添加 organizationId 过滤
3. 更新前端显示角色名称

### 中期方案（2-3周）- 完整解决
1. 创建 Role 和 UserRole 表（方案B）
2. 实现 PermissionService 和 PermissionGuard
3. 迁移现有数据
4. 添加角色管理界面

### 长期方案（1-2月）- 企业级
1. 添加审批工作流引擎
2. 实现细粒度审计日志
3. 动态权限配置界面
4. 权限分析和报表

---

## ✅ 验收标准

测试场景：
```
✅ 供应商A的QC看不到供应商B的设备
✅ 只负责PLC的QC看不到MOT产品
✅ 包装员不能打包未通过质检的设备
✅ 平台QC可以查看所有供应商的质检记录
✅ 临时权限在到期后自动失效
✅ 权限变更后30分钟内生效（缓存TTL）
```

---

**推荐：** 先实施方案A解决紧急问题（1周），然后规划方案B的完整实现（2-3周）。
