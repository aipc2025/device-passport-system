# 专家服务撮合平台业务闭环设计

> 版本: 1.0
> 日期: 2026-02-01
> 状态: 设计完成，待实现

## 一、业务概述

构建完整的客户服务请求与专家接单撮合系统，包含：
1. **专家状态管理** - 抢单、空闲、预定中、服务中四种工作状态
2. **服务请求发布** - 客户发布设备服务需求
3. **智能撮合引擎** - 多维度匹配评分，自动推荐专家
4. **订单全生命周期** - 从发布到完成的闭环管理
5. **平台盈利模式** - 多元化收入来源
6. **设备护照关联** - 设备服务与护照系统打通
7. **第三方设备接管** - 纳入更多设备到平台生态
8. **积分激励体系** - 奖惩制度促进平台活跃

---

## 二、专家工作状态定义

### 2.1 状态枚举 (ExpertWorkStatus)

```typescript
export enum ExpertWorkStatus {
  RUSHING = 'RUSHING',      // 抢单中 - 急需订单，优先分配
  IDLE = 'IDLE',            // 空闲 - 一般等待分配
  BOOKED = 'BOOKED',        // 预定中 - 已分配订单，但当前空闲
  IN_SERVICE = 'IN_SERVICE', // 服务中 - 已出发或正在服务
  OFF_DUTY = 'OFF_DUTY',    // 休息中 - 暂不接单
}
```

### 2.2 状态转换规则

```
                    ┌──────────────┐
                    │   OFF_DUTY   │
                    │   (休息中)    │
                    └──────┬───────┘
                           │ 上线
                           ▼
┌──────────┐  开启抢单  ┌──────────┐
│ RUSHING  │◄──────────│   IDLE   │
│ (抢单中)  │──────────►│  (空闲)   │
└────┬─────┘  关闭抢单  └────┬─────┘
     │                       │
     │    接受订单分配        │ 接受订单分配
     └──────────┬────────────┘
                ▼
          ┌──────────┐
          │  BOOKED  │
          │ (预定中)  │
          └────┬─────┘
               │ 开始服务
               ▼
          ┌──────────┐
          │IN_SERVICE│
          │ (服务中)  │
          └────┬─────┘
               │ 完成服务
               ▼
          ┌──────────┐
          │   IDLE   │
          │  (空闲)   │
          └──────────┘
```

### 2.3 状态特性说明

| 状态 | 接单优先级 | 平台增值服务 | 显示颜色 |
|------|-----------|-------------|---------|
| RUSHING (抢单中) | 最高 | 付费服务，优先推送订单 | 红色/橙色 |
| IDLE (空闲) | 正常 | 免费基础匹配 | 绿色 |
| BOOKED (预定中) | 不接新单 | - | 蓝色 |
| IN_SERVICE (服务中) | 不接新单 | - | 紫色 |
| OFF_DUTY (休息中) | 不接单 | - | 灰色 |

---

## 三、完整业务流程

### 3.1 客户发布服务请求流程

```
1. 客户创建服务请求 (ServiceRequest)
   ├── 填写设备信息、问题描述
   ├── 选择服务类型 (安装/维修/保养/检测等)
   ├── 设置紧急程度 (LOW/NORMAL/HIGH/URGENT)
   ├── 填写服务地址、期望时间
   ├── 设置预算范围
   └── 选择技能要求

2. 发布请求 (DRAFT → OPEN)
   ├── 系统生成请求编号 SR-YYMM-NNNNNN
   ├── 触发智能匹配引擎
   └── 通知符合条件的专家

3. 等待专家响应
   ├── 显示已匹配专家列表
   ├── 专家可查看、申请
   └── 客户可查看申请人资料
```

### 3.2 专家接单流程

```
1. 专家收到订单推送
   ├── RUSHING状态专家优先收到通知
   ├── 根据匹配评分排序推送
   └── 显示订单详情和预计收益

2. 专家申请接单 (ExpertApplication)
   ├── 填写报价、预计工时
   ├── 说明服务方案
   └── 确认可服务时间

3. 客户选择专家
   ├── 查看多个申请
   ├── 比较资质、评价、报价
   └── 确认选择一位专家

4. 订单确认
   ├── 系统自动拒绝其他申请
   ├── 创建服务记录 (ExpertServiceRecord)
   ├── 专家状态 → BOOKED
   └── 双方收到确认通知
```

### 3.3 服务执行流程

```
1. 服务开始
   ├── 专家点击"开始服务"
   ├── 状态 → IN_SERVICE
   ├── 记录实际开始时间
   └── 通知客户专家已出发

2. 服务进行中
   ├── 专家可更新进度
   ├── 双方可在线沟通
   └── 支持上传现场照片

3. 服务完成
   ├── 专家点击"完成服务"
   ├── 填写服务报告
   ├── 上传完工照片
   └── 提交费用明细

4. 客户确认
   ├── 客户查看服务报告
   ├── 确认服务完成
   ├── 支付服务费用
   └── 专家状态 → IDLE

5. 评价反馈
   ├── 客户对专家评分 (1-5星)
   ├── 填写评价内容
   ├── 专家可回复评价
   └── 更新专家综合评分
```

### 3.4 服务记录状态流转

```typescript
export enum ServiceRecordStatus {
  PENDING = 'PENDING',         // 待开始 - 订单已确认，等待服务
  IN_PROGRESS = 'IN_PROGRESS', // 进行中 - 专家正在服务
  COMPLETED = 'COMPLETED',     // 已完成 - 服务完成待确认
  CONFIRMED = 'CONFIRMED',     // 已确认 - 客户确认完成
  CANCELLED = 'CANCELLED',     // 已取消
  DISPUTED = 'DISPUTED',       // 争议中
}
```

---

## 四、平台盈利模式

### 4.1 收入来源矩阵

| 收入类型 | 描述 | 收费对象 | 收费方式 | 预计占比 |
|---------|------|---------|---------|---------|
| **服务佣金** | 每笔成交订单抽成 | 专家 | 订单金额的 10-15% | 40% |
| **抢单会员** | RUSHING状态服务费 | 专家 | 月费/年费 | 25% |
| **置顶推广** | 服务请求置顶展示 | 客户 | 按次/按天收费 | 10% |
| **认证服务** | 专家资质认证 | 专家 | 一次性/年费 | 10% |
| **保险服务** | 服务质量保险 | 客户/专家 | 订单金额比例 | 10% |
| **增值功能** | 数据分析、API接口等 | 企业客户 | 订阅制 | 5% |

### 4.2 服务佣金详细设计

```typescript
// 佣金费率配置
export interface CommissionConfig {
  baseRate: number;           // 基础费率 (默认 10%)
  urgentBonus: number;        // 紧急订单加成 (+2%)
  largeOrderDiscount: number; // 大额订单折扣 (-2%)
  loyaltyDiscount: number;    // 忠诚度折扣 (-1% per level)
  minAmount: number;          // 最低收费 (如 $10)
  maxAmount: number;          // 封顶金额 (如 $500)
}

// 佣金计算示例
const calculateCommission = (orderAmount: number, config: CommissionConfig) => {
  let rate = config.baseRate;
  // 应用各种调整...
  const commission = orderAmount * rate;
  return Math.max(config.minAmount, Math.min(config.maxAmount, commission));
};
```

### 4.3 抢单会员服务 (核心增值服务)

**服务等级设计：**

| 等级 | 月费 | 年费 | 权益 |
|------|-----|------|-----|
| **标准版** | 免费 | 免费 | 正常匹配，无优先 |
| **银牌会员** | ¥99 | ¥999 | 优先推送，置顶展示 |
| **金牌会员** | ¥199 | ¥1999 | 极速推送(5秒内)，专属客服，佣金9折 |
| **钻石会员** | ¥399 | ¥3999 | 独家优先，佣金8折，平台推荐位 |

**技术实现：**
```typescript
// 专家会员等级
export enum ExpertMembershipLevel {
  STANDARD = 'STANDARD',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
}

// 推送优先级计算
const getNotificationPriority = (expert: IndividualExpert) => {
  let priority = 0;

  // 会员等级加成
  switch (expert.membershipLevel) {
    case 'DIAMOND': priority += 100; break;
    case 'GOLD': priority += 50; break;
    case 'SILVER': priority += 20; break;
  }

  // RUSHING状态加成
  if (expert.workStatus === 'RUSHING') {
    priority += 30;
  }

  // 评分加成
  priority += (expert.avgRating || 0) * 10;

  return priority;
};
```

### 4.4 其他增值服务

1. **专家认证徽章**
   - 身份认证 (实名/企业): ¥50
   - 技能认证 (考试/证书): ¥100/项
   - 平台推荐专家: ¥500/年

2. **客户增值服务**
   - 紧急置顶 (24小时): ¥30
   - 定向推送 (指定专家): ¥20/位
   - 服务保险: 订单金额 2%

3. **企业服务**
   - API接入: ¥5000/年
   - 专属匹配池: ¥10000/年
   - 数据分析报表: ¥2000/年

---

## 五、数据库设计变更

### 5.1 新增/修改字段

**IndividualExpert 表新增字段：**
```typescript
// 工作状态
@Column({
  type: 'varchar',
  length: 20,
  default: ExpertWorkStatus.IDLE,
})
workStatus: ExpertWorkStatus;

// 会员等级
@Column({
  type: 'varchar',
  length: 20,
  default: ExpertMembershipLevel.STANDARD,
})
membershipLevel: ExpertMembershipLevel;

// 会员到期时间
@Column({ type: 'timestamp', nullable: true })
membershipExpiresAt: Date;

// 当前进行中的服务数量
@Column({ type: 'int', default: 0 })
activeServiceCount: number;

// 最大同时服务数量
@Column({ type: 'int', default: 1 })
maxConcurrentServices: number;

// 抢单开始时间 (用于排序)
@Column({ type: 'timestamp', nullable: true })
rushingStartedAt: Date;
```

### 5.2 新增实体

**ExpertMembership (会员订阅记录):**
```typescript
@Entity('expert_memberships')
export class ExpertMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  expertId: string;

  @Column({ type: 'varchar', length: 20 })
  level: ExpertMembershipLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY' })
  currency: string;

  @Column({ type: 'varchar', length: 20 })
  period: 'MONTHLY' | 'YEARLY';

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

  @CreateDateColumn()
  createdAt: Date;
}
```

**PlatformTransaction (平台交易记录):**
```typescript
@Entity('platform_transactions')
export class PlatformTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  transactionCode: string; // PT-YYMM-NNNNNN

  @Column({ type: 'varchar', length: 30 })
  type: TransactionType; // COMMISSION, MEMBERSHIP, PROMOTION, etc.

  @Column({ nullable: true })
  serviceRecordId: string;

  @Column({ nullable: true })
  expertId: string;

  @Column({ nullable: true })
  customerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED';

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 六、API端点设计

### 6.1 专家状态管理

```
PATCH /experts/:id/work-status
  - 更新工作状态 (RUSHING/IDLE/OFF_DUTY)
  - BOOKED/IN_SERVICE 由系统自动设置

GET /experts/:id/work-summary
  - 获取当前工作摘要 (状态、进行中订单、待开始订单)

POST /experts/:id/start-rushing
  - 开启抢单模式 (需要有效会员或扣费)

POST /experts/:id/stop-rushing
  - 关闭抢单模式
```

### 6.2 服务记录管理

```
POST /service-records/:id/start
  - 专家开始服务 (PENDING → IN_PROGRESS)
  - 专家状态 → IN_SERVICE

POST /service-records/:id/complete
  - 专家完成服务 (IN_PROGRESS → COMPLETED)
  - 提交服务报告

POST /service-records/:id/confirm
  - 客户确认完成 (COMPLETED → CONFIRMED)
  - 触发佣金结算
  - 专家状态 → IDLE (如无其他订单)

POST /service-records/:id/dispute
  - 发起争议

GET /service-records/active
  - 获取进行中的服务记录
```

### 6.3 会员服务

```
GET /memberships/plans
  - 获取会员套餐列表

POST /memberships/subscribe
  - 订阅会员服务

GET /memberships/my
  - 获取当前会员状态

POST /memberships/cancel
  - 取消自动续费
```

### 6.4 平台交易

```
GET /transactions/my
  - 获取我的交易记录

GET /transactions/summary
  - 获取收支汇总

GET /admin/transactions
  - 管理员查看所有交易

GET /admin/revenue-report
  - 平台收入报表
```

---

## 七、匹配算法优化

### 7.1 优先级排序因素

```typescript
const calculateMatchPriority = (expert, serviceRequest) => {
  let score = 0;

  // 1. 会员等级权重 (0-100)
  score += getMembershipScore(expert.membershipLevel);

  // 2. 抢单状态加成 (0-30)
  if (expert.workStatus === 'RUSHING') {
    score += 30;
    // 抢单时长加成 (越早开始越高)
    const rushingHours = getHoursSince(expert.rushingStartedAt);
    score += Math.min(rushingHours * 2, 20);
  }

  // 3. 地理距离 (0-30)
  score += getLocationScore(expert, serviceRequest);

  // 4. 技能匹配 (0-25)
  score += getSkillMatchScore(expert, serviceRequest);

  // 5. 历史评分 (0-15)
  score += (expert.avgRating || 3) * 3;

  return score;
};
```

### 7.2 推送策略

1. **钻石会员**: 即时推送，独家5分钟窗口
2. **金牌会员**: 5秒内推送
3. **银牌会员**: 30秒内推送
4. **标准会员**: 1分钟后推送
5. **RUSHING状态**: 在同级别中优先

---

## 八、设备护照与专家服务关联设计

### 8.1 当前系统断层分析

```
┌─────────────────────────────────────────────────────────────────┐
│                     现有系统架构                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐         ┌─────────────┐                       │
│  │DevicePassport│◄───────│ServiceOrder │ ✓ 已关联              │
│  │  (设备护照)   │         │ (服务工单)   │                       │
│  └──────┬──────┘         └─────────────┘                       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │LifecycleEvent│ ✓ 已关联 (记录设备生命周期)                    │
│  │  (生命周期)   │                                               │
│  └─────────────┘                                               │
│                                                                 │
│  ════════════════════════════════════════════════════════════  │
│                       完 全 隔 离                               │
│  ════════════════════════════════════════════════════════════  │
│                                                                 │
│  ┌─────────────┐         ┌──────────────────┐                  │
│  │ServiceRequest│ ✗ 无关联 │ExpertServiceRecord│ ✗ 无关联        │
│  │  (服务请求)   │         │   (专家服务记录)   │                  │
│  └─────────────┘         └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 目标架构：形成完整闭环

```
┌─────────────────────────────────────────────────────────────────┐
│                     目标系统架构                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DevicePassport                        │   │
│  │                     (设备护照)                            │   │
│  │  - passportCode: DP-XXX-XXXX-XX-XX-XXXXXX-XX           │   │
│  │  - status: DeviceStatus (IN_SERVICE / MAINTENANCE)      │   │
│  │  - maintenanceHistory: 完整服务历史                       │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌────────────┐    ┌────────────┐    ┌────────────────┐       │
│  │ServiceOrder│    │ServiceRequest│  │LifecycleEvent │       │
│  │ (内部工单)  │    │ (公开服务请求)│  │ (生命周期事件) │       │
│  └─────┬──────┘    └──────┬─────┘    └────────────────┘       │
│        │                  │                                    │
│        │                  ▼                                    │
│        │           ┌────────────────┐                          │
│        │           │ExpertApplication│                         │
│        │           │   (专家申请)    │                          │
│        │           └──────┬─────────┘                          │
│        │                  │ 选中专家                            │
│        │                  ▼                                    │
│        │           ┌──────────────────┐                        │
│        └──────────►│ExpertServiceRecord│◄─── 双向关联设备        │
│                    │   (专家服务记录)   │                        │
│                    └────────┬─────────┘                        │
│                             │                                  │
│                    ┌────────┴────────┐                         │
│                    ▼                 ▼                         │
│             ┌───────────┐    ┌─────────────┐                   │
│             │ExpertReview│   │LifecycleEvent│                  │
│             │  (专家评价) │   │ (服务完成事件) │                  │
│             └───────────┘    └─────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 数据模型变更

**ServiceRequest 新增字段：**
```typescript
// 关联设备护照 (可选，某些咨询类服务可能不需要)
@Column({ nullable: true })
passportId: string;

@ManyToOne(() => DevicePassport, { nullable: true })
@JoinColumn({ name: 'passport_id' })
passport: DevicePassport;

// 冗余存储护照码，方便查询
@Column({ type: 'varchar', length: 50, nullable: true })
passportCode: string;

// 设备基本信息快照 (发起请求时的设备状态)
@Column({ type: 'jsonb', nullable: true })
deviceSnapshot: {
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  currentStatus: DeviceStatus;
  warrantyExpiry?: Date;
};
```

**ExpertServiceRecord 新增字段：**
```typescript
// 关联设备护照
@Column({ nullable: true })
passportId: string;

@ManyToOne(() => DevicePassport, { nullable: true })
@JoinColumn({ name: 'passport_id' })
passport: DevicePassport;

// 冗余护照码
@Column({ type: 'varchar', length: 50, nullable: true })
passportCode: string;

// 服务前设备状态
@Column({ type: 'varchar', length: 30, nullable: true })
deviceStatusBefore: DeviceStatus;

// 服务后设备状态
@Column({ type: 'varchar', length: 30, nullable: true })
deviceStatusAfter: DeviceStatus;

// 维护类型细分
@Column({ type: 'varchar', length: 30, nullable: true })
maintenanceType: MaintenanceType; // PREVENTIVE, CORRECTIVE, EMERGENCY
```

**新增枚举：**
```typescript
export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',   // 预防性维护 (定期保养)
  CORRECTIVE = 'CORRECTIVE',   // 纠正性维护 (故障维修)
  EMERGENCY = 'EMERGENCY',     // 紧急维护 (突发故障)
  UPGRADE = 'UPGRADE',         // 升级改造
  INSPECTION = 'INSPECTION',   // 检测检验
}
```

### 8.4 业务流程与状态联动

**场景1: 客户发起设备服务请求**

```
1. 客户扫描设备护照二维码 或 手动输入护照码
   └── 系统自动填充设备信息

2. 创建 ServiceRequest
   ├── passportId = 设备护照ID
   ├── passportCode = DP-XXX-...
   ├── deviceSnapshot = { 当前设备信息快照 }
   └── serviceType = REPAIR/MAINTENANCE/...

3. 设备状态检查
   ├── 如果设备正在服务中 → 提示客户
   └── 记录请求关联到设备
```

**场景2: 专家接单并开始服务**

```
1. 专家申请被接受，创建 ExpertServiceRecord
   ├── 继承 passportId 从 ServiceRequest
   ├── deviceStatusBefore = passport.status
   └── 专家状态 → BOOKED

2. 专家开始服务
   ├── ExpertServiceRecord.status → IN_PROGRESS
   ├── 专家状态 → IN_SERVICE
   ├── 设备状态 → MAINTENANCE (自动更新)
   └── 创建 LifecycleEvent (SERVICE_STARTED)
       {
         eventType: 'SERVICE_PERFORMED',
         description: '专家服务开始',
         metadata: {
           serviceRecordId,
           expertId,
           expertName,
           serviceType
         }
       }
```

**场景3: 服务完成与状态恢复**

```
1. 专家完成服务
   ├── ExpertServiceRecord.status → COMPLETED
   ├── deviceStatusAfter = IN_SERVICE (或其他状态)
   └── 创建 LifecycleEvent (SERVICE_COMPLETED)

2. 客户确认
   ├── ExpertServiceRecord.status → CONFIRMED
   ├── 设备状态 → deviceStatusAfter (自动更新)
   ├── 专家状态 → IDLE (如无其他订单)
   ├── 触发评价流程
   └── 触发佣金计算

3. 设备维护历史更新
   └── DevicePassport.lifecycleEvents 新增完整记录
```

---

## 九、服务请求类型与第三方设备接管

### 9.1 服务请求分类

```typescript
export enum ServiceRequestCategory {
  // 设备相关服务
  DEVICE_REPAIR = 'DEVICE_REPAIR',         // 设备维修 (需护照)
  DEVICE_MAINTENANCE = 'DEVICE_MAINTENANCE', // 设备保养 (需护照)
  DEVICE_INSTALLATION = 'DEVICE_INSTALLATION', // 设备安装 (可选护照)
  DEVICE_INSPECTION = 'DEVICE_INSPECTION', // 设备检测 (需护照)

  // 第三方设备接管
  DEVICE_TAKEOVER = 'DEVICE_TAKEOVER',     // 接管第三方设备 (生成新护照)

  // 纯劳务服务 (无设备关联)
  LABOR_ELECTRICAL = 'LABOR_ELECTRICAL',   // 电工服务
  LABOR_MECHANICAL = 'LABOR_MECHANICAL',   // 机械服务
  LABOR_PLUMBING = 'LABOR_PLUMBING',       // 管道服务
  LABOR_GENERAL = 'LABOR_GENERAL',         // 通用劳务

  // 咨询服务
  CONSULTING = 'CONSULTING',               // 技术咨询
  TRAINING = 'TRAINING',                   // 培训服务
}

// 服务请求必须关联设备的类型
export const DEVICE_REQUIRED_CATEGORIES = [
  'DEVICE_REPAIR',
  'DEVICE_MAINTENANCE',
  'DEVICE_INSPECTION',
];

// 可以生成新护照的类型
export const PASSPORT_GENERATABLE_CATEGORIES = [
  'DEVICE_TAKEOVER',
  'DEVICE_INSTALLATION',
];
```

### 9.2 第三方设备接管流程

**场景**: 客户有一台非平台管理的设备，需要纳入系统管理

```
┌─────────────────────────────────────────────────────────────────┐
│                   第三方设备接管流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 客户发起接管请求 (ServiceRequestCategory.DEVICE_TAKEOVER)    │
│     ├── 填写设备基本信息 (品牌/型号/序列号/购买日期)              │
│     ├── 上传设备照片、铭牌照片                                   │
│     ├── 选择接管原因 (新购设备/转让设备/原厂商不再服务等)         │
│     └── 提交接管申请                                            │
│                                                                 │
│  2. 专家现场验机 (可选，根据设备价值决定)                         │
│     ├── 专家上门检测设备状态                                     │
│     ├── 拍摄验机照片/视频                                        │
│     ├── 填写设备健康评估报告                                     │
│     └── 确认设备信息准确性                                       │
│                                                                 │
│  3. 平台审核 (高价值设备需人工审核)                               │
│     ├── 验证设备信息                                            │
│     ├── 检查是否重复接管                                        │
│     └── 审核通过                                                │
│                                                                 │
│  4. 生成设备护照                                                 │
│     ├── 分配护照码 DP-XXX-YYMM-PP-OT-NNNNNN-XX                  │
│     │   └── originCode = "OT" (Other/接管设备)                  │
│     ├── 创建 DevicePassport 记录                                │
│     ├── 记录初始 LifecycleEvent (TAKEOVER)                      │
│     └── 生成护照二维码                                          │
│                                                                 │
│  5. 激励奖励                                                     │
│     ├── 客户获得接管积分奖励                                     │
│     ├── 验机专家获得服务费 + 积分                                │
│     └── 设备纳入平台生态                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 第三方设备数据模型

```typescript
// 设备接管申请
@Entity('device_takeover_requests')
export class DeviceTakeoverRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  requestCode: string; // TK-YYMM-NNNNNN

  @Column()
  customerId: string;

  // 设备基本信息
  @Column({ type: 'varchar', length: 100 })
  deviceName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceModel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  // 接管原因
  @Column({ type: 'varchar', length: 50 })
  takeoverReason: TakeoverReason;

  @Column({ type: 'text', nullable: true })
  reasonDescription: string;

  // 上传资料
  @Column({ type: 'jsonb', nullable: true })
  photos: string[]; // 设备照片URLs

  @Column({ type: 'jsonb', nullable: true })
  documents: string[]; // 购买凭证等

  // 验机信息
  @Column({ nullable: true })
  inspectionExpertId: string;

  @Column({ type: 'jsonb', nullable: true })
  inspectionReport: {
    overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    functionalStatus: string;
    notes: string;
    photos: string[];
    inspectedAt: Date;
  };

  // 状态
  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status: 'PENDING' | 'INSPECTING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

  // 生成的护照
  @Column({ nullable: true })
  generatedPassportId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  generatedPassportCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum TakeoverReason {
  NEW_PURCHASE = 'NEW_PURCHASE',     // 新购设备
  TRANSFER = 'TRANSFER',             // 设备转让
  NO_SUPPORT = 'NO_SUPPORT',         // 原厂商不再支持
  SYSTEM_MIGRATION = 'SYSTEM_MIGRATION', // 系统迁移
  OTHER = 'OTHER',
}
```

### 9.4 纯劳务服务请求

**场景**: 客户需要临时电工接线3天，无具体设备

```typescript
// ServiceRequest 扩展字段
@Column({ type: 'varchar', length: 50 })
category: ServiceRequestCategory;

// 劳务服务特有字段
@Column({ type: 'jsonb', nullable: true })
laborDetails: {
  // 工期
  estimatedDays: number;       // 预计工期 (天)
  workSchedule: string;        // 工作时间安排 "每天 8:00-18:00"

  // 技能要求
  requiredCertifications: string[]; // 需要的证书 ["低压电工证", "高空作业证"]
  experienceYears: number;     // 最低经验年限

  // 人员要求
  requiredWorkers: number;     // 需要人数

  // 工作内容描述
  workScope: string;           // 工作范围描述
  safetyRequirements: string;  // 安全要求

  // 材料
  materialsProvided: boolean;  // 客户是否提供材料
  materialsDescription?: string;
};

// 示例: 临时电工接线3天
const laborServiceRequest = {
  category: 'LABOR_ELECTRICAL',
  title: '临时电工接线服务',
  description: '厂房新增生产线，需要临时电工进行电气线路敷设',
  laborDetails: {
    estimatedDays: 3,
    workSchedule: '每天 8:00-17:00',
    requiredCertifications: ['低压电工操作证'],
    experienceYears: 3,
    requiredWorkers: 2,
    workScope: '380V动力线敷设、接线、调试',
    safetyRequirements: '必须佩戴安全帽、绝缘手套',
    materialsProvided: true,
  },
  budgetMin: 1500,
  budgetMax: 2500,
  urgency: 'NORMAL',
};
```

---

## 十、积分与信用体系

### 10.1 积分体系概述

```typescript
// 积分类型
export enum PointType {
  REWARD = 'REWARD',     // 奖励积分 (可用于兑换)
  CREDIT = 'CREDIT',     // 信用分 (影响排名和权益)
  PENALTY = 'PENALTY',   // 惩罚扣分
}

// 用户信用等级
export enum CreditLevel {
  BRONZE = 'BRONZE',     // 青铜: 0-199
  SILVER = 'SILVER',     // 白银: 200-499
  GOLD = 'GOLD',         // 黄金: 500-999
  PLATINUM = 'PLATINUM', // 铂金: 1000-1999
  DIAMOND = 'DIAMOND',   // 钻石: 2000+
}
```

### 10.2 正向激励行为 (Reward Actions)

| 行为类别 | 行为描述 | 默认积分 | 备注 |
|---------|---------|---------|------|
| **发布服务** | 发布服务请求 | +10 | 每日上限3次 |
| **发布服务** | 首次发布服务 | +50 | 新用户奖励 |
| **发布服务** | 服务请求被成功匹配 | +20 | - |
| **完成服务** | 专家完成服务 | +30 | 基础奖励 |
| **完成服务** | 获得5星好评 | +50 | - |
| **完成服务** | 按时完成服务 | +10 | 未超时 |
| **接受服务** | 客户确认完成 | +15 | - |
| **接受服务** | 客户给出评价 | +10 | - |
| **推荐注册** | 邀请新用户注册 | +100 | 被邀请人完成注册 |
| **推荐注册** | 被邀请人首次交易 | +200 | 被邀请人完成首单 |
| **设备接管** | 成功接管设备 | +50 | 扩展平台生态 |
| **设备接管** | 专家完成验机 | +30 | - |
| **活跃奖励** | 连续7天登录 | +20 | - |
| **活跃奖励** | 连续30天活跃 | +100 | - |
| **完善资料** | 完成实名认证 | +100 | 一次性 |
| **完善资料** | 上传证书 | +30/张 | - |
| **优质内容** | 服务报告被点赞 | +5 | - |

### 10.3 惩罚行为 (Penalty Actions)

| 行为类别 | 行为描述 | 默认扣分 | 严重程度 |
|---------|---------|---------|---------|
| **服务违约** | 专家无故取消订单 | -50 | 中 |
| **服务违约** | 客户无故取消已接单服务 | -30 | 中 |
| **服务违约** | 服务超时未完成 | -20 | 轻 |
| **服务违约** | 严重超时 (>24小时) | -50 | 中 |
| **投诉相关** | 收到有效投诉 | -30 | 中 |
| **投诉相关** | 投诉升级处理 | -80 | 重 |
| **投诉相关** | 恶意投诉他人 | -100 | 重 |
| **评价相关** | 收到1星差评 | -20 | 轻 |
| **评价相关** | 虚假评价 | -100 | 重 |
| **行为违规** | 辱骂/骚扰他人 | -100 | 重 |
| **行为违规** | 恶意刷单 | -200 | 严重 |
| **行为违规** | 欺诈行为 | -500 | 严重 |
| **账户违规** | 虚假资料 | -100 | 重 |
| **爽约** | 预约后失约 | -40 | 中 |

### 10.4 积分实体设计

```typescript
// 积分记录
@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  userType: 'CUSTOMER' | 'EXPERT';

  @Column({ type: 'varchar', length: 20 })
  pointType: PointType; // REWARD | CREDIT | PENALTY

  @Column({ type: 'varchar', length: 50 })
  actionCode: string; // 行为代码，对应配置表

  @Column({ type: 'int' })
  points: number; // 正数加分，负数扣分

  @Column({ type: 'int' })
  balanceBefore: number;

  @Column({ type: 'int' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  // 关联业务
  @Column({ nullable: true })
  relatedServiceRecordId: string;

  @Column({ nullable: true })
  relatedUserId: string; // 如推荐人

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

// 用户积分账户
@Entity('point_accounts')
export class PointAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  userType: 'CUSTOMER' | 'EXPERT';

  // 奖励积分 (可消费)
  @Column({ type: 'int', default: 0 })
  rewardPoints: number;

  // 信用分
  @Column({ type: 'int', default: 100 })
  creditScore: number;

  // 信用等级
  @Column({ type: 'varchar', length: 20, default: 'BRONZE' })
  creditLevel: CreditLevel;

  // 累计获得积分
  @Column({ type: 'int', default: 0 })
  totalEarnedPoints: number;

  // 累计消费积分
  @Column({ type: 'int', default: 0 })
  totalSpentPoints: number;

  // 累计扣分
  @Column({ type: 'int', default: 0 })
  totalPenaltyPoints: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 10.5 积分规则配置实体

```typescript
// 积分规则配置 (管理员可编辑)
@Entity('point_rules')
export class PointRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  actionCode: string; // 唯一行为代码

  @Column({ type: 'varchar', length: 100 })
  actionName: string; // 行为名称

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string; // 详细描述

  @Column({ type: 'varchar', length: 50 })
  category: string; // 行为分类

  @Column({ type: 'varchar', length: 20 })
  pointType: PointType;

  @Column({ type: 'int' })
  defaultPoints: number; // 默认积分值

  @Column({ type: 'int', nullable: true })
  minPoints: number; // 最小值 (管理员调整范围)

  @Column({ type: 'int', nullable: true })
  maxPoints: number; // 最大值

  // 限制条件
  @Column({ type: 'int', nullable: true })
  dailyLimit: number; // 每日次数上限

  @Column({ type: 'int', nullable: true })
  totalLimit: number; // 总次数上限 (一次性奖励)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // 是否启用

  // 触发条件 (JSON条件表达式)
  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    minOrderAmount?: number;  // 最低订单金额
    minRating?: number;       // 最低评分
    userLevel?: string[];     // 适用用户等级
    timeRange?: {             // 时间限制
      startTime?: string;
      endTime?: string;
    };
  };

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // 排序

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 10.6 信用等级权益

| 等级 | 信用分范围 | 权益 |
|------|-----------|------|
| **青铜** | 0-199 | 基础功能，无特权 |
| **白银** | 200-499 | 优先客服，基础折扣 |
| **黄金** | 500-999 | 专属标识，服务费9.5折 |
| **铂金** | 1000-1999 | 优先匹配，服务费9折，专属客服 |
| **钻石** | 2000+ | 最高优先级，服务费8.5折，VIP客服，平台推荐 |

### 10.7 积分使用场景

1. **抵扣服务费**: 100积分 = ¥1
2. **兑换会员**: 银牌会员 = 5000积分/月
3. **置顶服务请求**: 500积分/24小时
4. **优先匹配权**: 200积分/次
5. **兑换礼品**: 平台商城礼品
6. **抽奖**: 参与平台活动

---

## 十一、管理员规则配置后台

### 11.1 规则管理功能

```typescript
// 管理员端点
// GET  /admin/point-rules          - 获取所有规则
// POST /admin/point-rules          - 创建新规则
// PATCH /admin/point-rules/:id     - 修改规则
// DELETE /admin/point-rules/:id    - 删除规则
// POST /admin/point-rules/batch    - 批量导入规则
// GET  /admin/point-rules/export   - 导出规则
```

### 11.2 积分统计报表

```typescript
// GET /admin/point-statistics
{
  // 总体统计
  overview: {
    totalPointsIssued: 1250000,    // 累计发放积分
    totalPointsConsumed: 450000,   // 累计消费积分
    totalPenaltyPoints: 35000,     // 累计扣除积分
    netCirculation: 765000,        // 净流通积分
  },

  // 按行为统计 (Top 10)
  byAction: [
    { actionCode: 'INVITE_REGISTER', actionName: '邀请注册', count: 5200, totalPoints: 520000 },
    { actionCode: 'SERVICE_COMPLETE', actionName: '完成服务', count: 12000, totalPoints: 360000 },
  ],

  // 按时间趋势
  trend: {
    daily: [...],
    weekly: [...],
    monthly: [...],
  },

  // 异常预警
  alerts: [
    { type: 'HIGH_PENALTY', message: '本周惩罚扣分异常增加 50%', severity: 'WARNING' },
    { type: 'INVITE_ABUSE', message: '检测到可能的刷邀请行为', severity: 'HIGH' },
  ],
}
```

---

## 十二、邀请推荐系统

### 12.1 邀请机制设计

```typescript
// 邀请码实体
@Entity('invitation_codes')
export class InvitationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inviterId: string; // 邀请人ID

  @Column({ type: 'varchar', length: 20 })
  inviterType: 'CUSTOMER' | 'EXPERT';

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string; // 邀请码 INV-XXXXXX

  @Column({ type: 'int', default: 0 })
  usedCount: number; // 使用次数

  @Column({ type: 'int', nullable: true })
  maxUses: number; // 最大使用次数 (null=无限)

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

// 邀请记录
@Entity('invitation_records')
export class InvitationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invitationCodeId: string;

  @Column()
  inviterId: string;

  @Column()
  inviteeId: string; // 被邀请人

  @Column({ type: 'varchar', length: 20 })
  inviteeType: 'CUSTOMER' | 'EXPERT';

  // 奖励状态
  @Column({ type: 'boolean', default: false })
  registerRewardClaimed: boolean; // 注册奖励已发放

  @Column({ type: 'boolean', default: false })
  firstOrderRewardClaimed: boolean; // 首单奖励已发放

  @CreateDateColumn()
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstOrderAt: Date;
}
```

### 12.2 邀请奖励规则

```
邀请人奖励
├── 被邀请人完成注册: +100 积分
├── 被邀请人完成首单: +200 积分
├── 被邀请人月消费满1000元: +50 积分 (每月一次)
└── 被邀请人成为VIP: +300 积分

被邀请人奖励
├── 新用户注册: +50 积分
├── 完善资料: +100 积分
└── 首单优惠: 服务费9折

防作弊机制
├── 同一设备/IP 最多3个新注册
├── 邀请人和被邀请人不能互相邀请
├── 新用户需完成实名认证后发放奖励
└── 异常邀请行为自动冻结审核
```

---

## 十三、实现计划

### 第一阶段: 专家状态管理
- [ ] 添加 ExpertWorkStatus 枚举
- [ ] 修改 IndividualExpert 实体
- [ ] 实现状态切换 API
- [ ] 前端状态显示和切换组件
- [ ] 修复 Expert Passports 页面显示问题

### 第二阶段: 服务请求分类与设备关联
- [ ] 添加 ServiceRequestCategory 枚举
- [ ] ServiceRequest 添加 category, passportId, laborDetails 字段
- [ ] ExpertServiceRecord 添加 passportId 字段
- [ ] 设备-服务状态自动同步
- [ ] 前端服务请求创建流程改造

### 第三阶段: 第三方设备接管
- [ ] 创建 DeviceTakeoverRequest 实体
- [ ] 接管申请提交/审核 API
- [ ] 验机流程
- [ ] 自动生成设备护照
- [ ] 前端接管申请页面

### 第四阶段: 积分体系基础
- [ ] 创建 PointAccount, PointTransaction, PointRule 实体
- [ ] 积分服务核心逻辑
- [ ] 常用行为积分自动发放
- [ ] 用户积分查询 API
- [ ] 前端积分显示组件

### 第五阶段: 惩罚机制
- [ ] 惩罚规则配置
- [ ] 自动扣分逻辑
- [ ] 投诉处理与扣分
- [ ] 信用等级计算

### 第六阶段: 管理员规则后台
- [ ] 规则CRUD API
- [ ] 规则配置页面
- [ ] 积分统计报表
- [ ] 异常行为预警

### 第七阶段: 邀请系统
- [ ] 邀请码生成与管理
- [ ] 邀请记录追踪
- [ ] 邀请奖励自动发放
- [ ] 防作弊检测

### 第八阶段: 会员与交易系统
- [ ] 会员订阅实现
- [ ] 平台佣金计算
- [ ] 积分兑换功能
- [ ] 财务报表

---

## 十四、验证清单

### 专家状态管理
- [ ] 专家可以切换工作状态 (RUSHING/IDLE/OFF_DUTY)
- [ ] 专家接单后状态自动变为 BOOKED
- [ ] 开始服务后状态自动变为 IN_SERVICE
- [ ] 完成服务后状态恢复为 IDLE

### 服务请求分类
- [ ] 可以创建设备相关服务请求 (需关联护照)
- [ ] 可以创建纯劳务服务请求 (无护照)
- [ ] 劳务请求可设置工期、人数、技能要求
- [ ] 设备维修/保养/检测类必须关联护照

### 设备-服务关联
- [ ] 创建服务请求时可关联设备护照
- [ ] 服务记录自动继承设备关联
- [ ] 服务开始时设备状态自动变为 MAINTENANCE
- [ ] 服务完成确认后设备状态自动恢复
- [ ] 设备维护历史完整记录所有服务
- [ ] 扫描设备可查看维护状态摘要

### 第三方设备接管
- [ ] 客户可以发起设备接管申请
- [ ] 可上传设备照片和资料
- [ ] 专家可执行现场验机
- [ ] 平台审核通过后自动生成护照
- [ ] 接管成功后双方获得积分奖励

### 积分系统
- [ ] 发布服务获得积分 (+10)
- [ ] 完成服务获得积分 (+30)
- [ ] 获得5星好评额外积分 (+50)
- [ ] 邀请新用户注册获得积分 (+100)
- [ ] 被邀请人首单额外积分 (+200)
- [ ] 设备接管获得积分 (+50)
- [ ] 用户可查看积分余额和记录

### 惩罚机制
- [ ] 无故取消订单扣分 (-50)
- [ ] 收到有效投诉扣分 (-30)
- [ ] 严重违规扣分 (-100~-500)
- [ ] 信用分低于阈值限制功能

### 规则配置后台
- [ ] 管理员可查看所有积分规则
- [ ] 管理员可修改规则分值
- [ ] 管理员可启用/禁用规则
- [ ] 管理员可设置每日上限
- [ ] 可查看积分统计报表

### 邀请系统
- [ ] 用户可生成专属邀请码
- [ ] 新用户可使用邀请码注册
- [ ] 邀请人自动获得奖励积分
- [ ] 被邀请人完成首单后双方再获奖励
- [ ] 防止刷邀请作弊

### 平台运营
- [ ] RUSHING 状态专家优先收到订单推送
- [ ] 会员专家享受对应权益
- [ ] 服务完成后自动计算平台佣金
- [ ] 客户可以对专家评分评价
- [ ] 专家评分自动更新
- [ ] 管理员可查看平台收入报表
- [ ] 积分可用于兑换服务或会员

---

## 十五、关键文件路径

**后端新增/修改:**
```
packages/shared/src/enums/index.ts
  - 添加 ServiceRequestCategory
  - 添加 TakeoverReason
  - 添加 PointType, CreditLevel
  - 添加 MaintenanceType

apps/api/src/database/entities/
  - device-takeover-request.entity.ts (新建)
  - point-account.entity.ts (新建)
  - point-transaction.entity.ts (新建)
  - point-rule.entity.ts (新建)
  - invitation-code.entity.ts (新建)
  - invitation-record.entity.ts (新建)
  - service-request.entity.ts (修改: 添加category, passportId, laborDetails)
  - expert-service-record.entity.ts (修改: 添加passportId)
  - individual-expert.entity.ts (修改: 添加workStatus, creditScore)

apps/api/src/modules/
  - point/ (新建模块)
    - point.module.ts
    - point.service.ts
    - point.controller.ts
  - invitation/ (新建模块)
    - invitation.module.ts
    - invitation.service.ts
    - invitation.controller.ts
  - device-takeover/ (新建模块)
    - device-takeover.module.ts
    - device-takeover.service.ts
    - device-takeover.controller.ts
```

**前端新增/修改:**
```
apps/web/src/pages/admin/
  - PointRuleList.tsx (新建: 积分规则管理)
  - PointStatistics.tsx (新建: 积分统计)
  - DeviceTakeoverList.tsx (新建: 接管申请管理)

apps/web/src/pages/
  - service-request/Create.tsx (修改: 支持分类选择)
  - device-takeover/Apply.tsx (新建: 接管申请)
  - points/MyPoints.tsx (新建: 我的积分)
  - invitation/MyInvitations.tsx (新建: 邀请中心)

apps/web/src/components/
  - PointBadge.tsx (新建: 积分显示)
  - CreditLevelBadge.tsx (新建: 信用等级)
  - InviteShareButton.tsx (新建: 邀请分享)
```
