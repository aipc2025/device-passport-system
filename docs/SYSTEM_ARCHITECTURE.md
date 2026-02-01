# 设备护照追溯系统 - 系统框架说明书

**版本**: 1.0.0
**更新日期**: 2026-02-01
**文档编号**: DPS-ARCH-001

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术架构](#2-技术架构)
3. [系统模块](#3-系统模块)
4. [数据库设计](#4-数据库设计)
5. [API接口设计](#5-api接口设计)
6. [前端架构](#6-前端架构)
7. [安全架构](#7-安全架构)
8. [部署架构](#8-部署架构)

---

## 1. 系统概述

### 1.1 系统简介

设备护照追溯系统（Device Passport Traceability System）是一个面向B2B场景的机电自动化设备全生命周期管理平台。系统通过数字护照（二维码）技术实现设备从采购、质检、组装、测试、交付到售后服务的全流程追溯。

### 1.2 核心功能

| 功能模块 | 描述 |
|---------|------|
| 设备护照管理 | 设备数字护照生成、查询、状态追踪 |
| 专家服务撮合 | 客户服务需求与专家技能智能匹配 |
| 服务工单管理 | 服务请求、工单分配、进度跟踪 |
| 供需匹配平台 | 供应商产品与买家需求智能匹配 |
| 积分信用体系 | 用户积分奖励与信用评级管理 |
| 邀请推荐系统 | 用户邀请与奖励机制 |

### 1.3 用户角色

```
┌─────────────────────────────────────────────────────────────┐
│                        用户角色体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  公开用户 (PUBLIC)                                          │
│  ├── 扫码查看设备公开信息                                    │
│  └── 提交服务请求                                           │
│                                                             │
│  客户 (CUSTOMER)                                            │
│  ├── 查看设备详情和服务历史                                  │
│  ├── 发布服务请求                                           │
│  ├── 确认服务完成并评价                                      │
│  └── 管理积分和邀请                                         │
│                                                             │
│  专家 (EXPERT)                                              │
│  ├── 申请接单                                               │
│  ├── 执行服务并提交报告                                      │
│  ├── 管理工作状态                                           │
│  └── 查看评价和收益                                         │
│                                                             │
│  供应商 (SUPPLIER)                                          │
│  ├── 发布产品信息                                           │
│  ├── 响应买家询价                                           │
│  └── 管理匹配结果                                           │
│                                                             │
│  买家 (BUYER)                                               │
│  ├── 发布采购需求 (RFQ)                                     │
│  ├── 查看供应商匹配                                         │
│  └── 发起询价                                               │
│                                                             │
│  管理员 (ADMIN)                                             │
│  ├── 用户和注册审核                                         │
│  ├── 系统配置管理                                           │
│  ├── 积分规则配置                                           │
│  └── 数据统计和报表                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术架构

### 2.1 技术栈总览

| 层级 | 技术选型 | 版本 |
|------|---------|------|
| 前端框架 | React + TypeScript | 18.x |
| UI框架 | Tailwind CSS | 3.x |
| 状态管理 | Zustand + React Query | 4.x / 5.x |
| 后端框架 | NestJS + TypeScript | 10.x |
| ORM | TypeORM | 0.3.x |
| 数据库 | PostgreSQL | 16.x |
| 缓存 | Redis | 7.x |
| 认证 | JWT + RBAC | - |
| API文档 | Swagger/OpenAPI | 3.0 |
| 包管理器 | pnpm | 9.x |
| 构建工具 | Turborepo + Vite | - |

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Web App   │  │ Mobile App  │  │  扫码终端   │                 │
│  │  (React)    │  │  (Future)   │  │  (QR Scan)  │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┴────────────────┘                         │
│                          │                                          │
│                    HTTPS / REST API                                 │
│                          │                                          │
├─────────────────────────────────────────────────────────────────────┤
│                           网关层                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Nginx / 负载均衡                          │   │
│  │              (SSL终止、静态资源、反向代理)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          │                                          │
├─────────────────────────────────────────────────────────────────────┤
│                          应用层                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NestJS API Server                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │  Auth   │ │Passport │ │ Expert  │ │ Match   │            │   │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │            │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │ Rating  │ │  Point  │ │ Invite  │ │Takeover │            │   │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │            │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          │                                          │
├─────────────────────────────────────────────────────────────────────┤
│                          数据层                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────┐              │
│  │   PostgreSQL    │              │      Redis      │              │
│  │   (主数据库)     │              │   (缓存/会话)   │              │
│  │                 │              │                 │              │
│  │ - 用户数据      │              │ - JWT Token     │              │
│  │ - 设备护照      │              │ - 会话缓存      │              │
│  │ - 服务记录      │              │ - 热点数据      │              │
│  │ - 交易数据      │              │                 │              │
│  └─────────────────┘              └─────────────────┘              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                          存储层                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    文件存储 (本地/OSS)                        │   │
│  │              (图片、文档、附件、二维码)                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 项目目录结构

```
device-passport-system/
├── apps/
│   ├── api/                      # NestJS 后端应用
│   │   ├── src/
│   │   │   ├── database/         # 数据库相关
│   │   │   │   ├── entities/     # TypeORM 实体
│   │   │   │   ├── migrations/   # 数据库迁移
│   │   │   │   └── seeds/        # 种子数据
│   │   │   ├── modules/          # 功能模块
│   │   │   │   ├── auth/         # 认证模块
│   │   │   │   ├── passport/     # 设备护照
│   │   │   │   ├── expert/       # 专家管理
│   │   │   │   ├── expert-rating/# 专家评价
│   │   │   │   ├── expert-matching/# 专家匹配
│   │   │   │   ├── service-request/# 服务请求
│   │   │   │   ├── service-order/# 服务工单
│   │   │   │   ├── point/        # 积分系统
│   │   │   │   ├── invitation/   # 邀请系统
│   │   │   │   ├── device-takeover/# 设备接管
│   │   │   │   ├── marketplace/  # 市场交易
│   │   │   │   ├── matching/     # 供需匹配
│   │   │   │   └── ...
│   │   │   ├── common/           # 公共模块
│   │   │   └── main.ts           # 应用入口
│   │   └── package.json
│   │
│   └── web/                      # React 前端应用
│       ├── src/
│       │   ├── components/       # 可复用组件
│       │   │   ├── layouts/      # 布局组件
│       │   │   ├── rating/       # 评价组件
│       │   │   └── ui/           # UI组件
│       │   ├── pages/            # 页面组件
│       │   │   ├── admin/        # 管理员页面
│       │   │   ├── expert/       # 专家页面
│       │   │   ├── customer/     # 客户页面
│       │   │   ├── supplier/     # 供应商页面
│       │   │   ├── buyer/        # 买家页面
│       │   │   ├── marketplace/  # 市场页面
│       │   │   ├── points/       # 积分页面
│       │   │   ├── invitation/   # 邀请页面
│       │   │   └── ...
│       │   ├── services/         # API服务
│       │   ├── store/            # 状态管理
│       │   ├── hooks/            # 自定义Hooks
│       │   ├── i18n/             # 国际化
│       │   └── App.tsx           # 应用入口
│       └── package.json
│
├── packages/
│   └── shared/                   # 共享类型和工具
│       └── src/
│           ├── enums/            # 枚举定义
│           ├── types/            # 类型定义
│           └── utils/            # 工具函数
│
├── docs/                         # 文档
├── docker/                       # Docker配置
├── scripts/                      # 脚本工具
├── turbo.json                    # Turborepo配置
├── pnpm-workspace.yaml           # pnpm工作区
└── package.json                  # 根配置
```

---

## 3. 系统模块

### 3.1 核心模块架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         核心业务模块                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                     设备护照模块 (Passport)                    │ │
│  │  - 护照码生成 (DP-XXX-YYMM-PP-OO-NNNNNN-CC)                   │ │
│  │  - 设备状态管理                                                │ │
│  │  - 生命周期事件记录                                            │ │
│  │  - 二维码生成与扫描                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    专家服务模块 (Expert)                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │ │
│  │  │ 专家档案    │  │ 工作状态    │  │ 专家护照    │            │ │
│  │  │ (Profile)   │  │ (Status)    │  │ (Passport)  │            │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   服务撮合模块 (Matching)                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │ │
│  │  │ 服务请求    │  │ 智能匹配    │  │ 服务记录    │            │ │
│  │  │ (Request)   │──▶│ (Algorithm) │──▶│ (Record)    │            │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    评价系统模块 (Rating)                       │ │
│  │  - 多维度评分 (质量/沟通/守时/性价比)                          │ │
│  │  - 评价内容管理                                                │ │
│  │  - 专家评分统计                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         平台运营模块                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   积分系统      │  │   邀请系统      │  │   会员系统      │    │
│  │   (Points)      │  │   (Invitation)  │  │   (Membership)  │    │
│  │                 │  │                 │  │                 │    │
│  │ - 积分规则     │  │ - 邀请码生成   │  │ - 会员等级     │    │
│  │ - 奖励发放     │  │ - 邀请追踪     │  │ - 权益管理     │    │
│  │ - 惩罚扣分     │  │ - 奖励发放     │  │ - 订阅管理     │    │
│  │ - 信用等级     │  │ - 防作弊       │  │                 │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 模块详细说明

#### 3.2.1 认证模块 (Auth)

| 功能 | 端点 | 描述 |
|------|------|------|
| 用户登录 | POST /auth/login | JWT Token认证 |
| 用户注册 | POST /auth/register | 新用户注册 |
| Token刷新 | POST /auth/refresh | 刷新访问令牌 |
| 获取用户信息 | GET /auth/me | 获取当前用户 |

#### 3.2.2 设备护照模块 (Passport)

| 功能 | 端点 | 描述 |
|------|------|------|
| 创建护照 | POST /passports | 创建设备护照 |
| 查询护照 | GET /passports | 护照列表查询 |
| 护照详情 | GET /passports/:id | 获取护照详情 |
| 状态更新 | PATCH /passports/:id/status | 更新设备状态 |
| 公开扫描 | GET /scan/:code | 公开信息查询 |

#### 3.2.3 专家模块 (Expert)

| 功能 | 端点 | 描述 |
|------|------|------|
| 专家列表 | GET /experts | 获取专家列表 |
| 专家详情 | GET /experts/:id | 获取专家信息 |
| 状态切换 | PATCH /experts/:id/work-status | 切换工作状态 |
| 生成护照 | POST /experts/:id/generate-passport | 生成专家护照 |

#### 3.2.4 服务请求模块 (ServiceRequest)

| 功能 | 端点 | 描述 |
|------|------|------|
| 创建请求 | POST /service-requests | 创建服务请求 |
| 发布请求 | POST /service-requests/:id/publish | 发布请求 |
| 申请接单 | POST /service-requests/:id/apply | 专家申请 |
| 接受申请 | POST /service-requests/applications/:id/accept | 接受申请 |

#### 3.2.5 服务记录模块 (ExpertRating)

| 功能 | 端点 | 描述 |
|------|------|------|
| 开始服务 | POST /expert-rating/service-records/:id/start | 开始服务 |
| 完成服务 | POST /expert-rating/service-records/:id/complete | 完成服务 |
| 确认完成 | POST /expert-rating/service-records/:id/confirm | 客户确认 |
| 提交评价 | POST /expert-rating/reviews | 提交评价 |

#### 3.2.6 积分模块 (Point)

| 功能 | 端点 | 描述 |
|------|------|------|
| 查询积分 | GET /points/my | 我的积分 |
| 积分记录 | GET /points/transactions | 交易记录 |
| 规则列表 | GET /admin/point-rules | 积分规则 |
| 创建规则 | POST /admin/point-rules | 创建规则 |

#### 3.2.7 邀请模块 (Invitation)

| 功能 | 端点 | 描述 |
|------|------|------|
| 生成邀请码 | POST /invitations/codes | 生成邀请码 |
| 我的邀请码 | GET /invitations/codes | 邀请码列表 |
| 验证邀请码 | GET /invitations/validate/:code | 验证有效性 |
| 邀请记录 | GET /invitations/records | 邀请记录 |

---

## 4. 数据库设计

### 4.1 核心实体关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         核心实体关系                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │ Organization │       │CompanyProfile│
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ email        │◄──────│ ownerId      │       │ orgId        │
│ password     │       │ name         │──────▶│ companyName  │
│ name         │       │ code         │       │ legalRep     │
│ role         │       │ type         │       │ businessScope│
└──────┬───────┘       └──────────────┘       └──────────────┘
       │
       │ 1:1
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│IndividualExpert│     │ExpertService │       │ ExpertReview │
│──────────────│       │   Record     │       │──────────────│
│ id           │       │──────────────│       │ id           │
│ userId       │◄──────│ expertId     │──────▶│ serviceRecordId
│ expertCode   │       │ serviceRequestId     │ overallRating│
│ workStatus   │       │ status       │       │ reviewText   │
│ avgRating    │       │ agreedPrice  │       │ createdAt    │
└──────────────┘       └──────────────┘       └──────────────┘
                              │
                              │ N:1
                              ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│DevicePassport│       │ServiceRequest│       │PointAccount  │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ passportCode │       │ title        │       │ userId       │
│ deviceName   │       │ description  │       │ rewardPoints │
│ status       │       │ status       │       │ creditScore  │
│ createdAt    │       │ urgency      │       │ creditLevel  │
└──────────────┘       └──────────────┘       └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│LifecycleEvent│       │InvitationCode│       │PointTransaction
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ passportId   │       │ inviterId    │       │ userId       │
│ eventType    │       │ code         │       │ actionCode   │
│ description  │       │ usedCount    │       │ points       │
│ occurredAt   │       │ expiresAt    │       │ createdAt    │
└──────────────┘       └──────────────┘       └──────────────┘
```

### 4.2 主要实体说明

#### 4.2.1 用户相关实体

| 实体 | 表名 | 说明 |
|------|------|------|
| User | users | 用户账户信息 |
| Organization | organizations | 组织/公司信息 |
| CompanyProfile | company_profiles | 公司详细资料 |
| IndividualExpert | individual_experts | 专家个人信息 |

#### 4.2.2 设备护照相关实体

| 实体 | 表名 | 说明 |
|------|------|------|
| DevicePassport | device_passports | 设备护照主表 |
| LifecycleEvent | lifecycle_events | 生命周期事件 |
| ServiceOrder | service_orders | 服务工单 |
| ServiceRecord | service_records | 服务记录明细 |

#### 4.2.3 专家服务相关实体

| 实体 | 表名 | 说明 |
|------|------|------|
| ServiceRequest | service_requests | 服务请求 |
| ExpertApplication | expert_applications | 专家申请 |
| ExpertServiceRecord | expert_service_records | 专家服务记录 |
| ExpertReview | expert_reviews | 专家评价 |
| ExpertMatchResult | expert_match_results | 匹配结果 |

#### 4.2.4 平台运营相关实体

| 实体 | 表名 | 说明 |
|------|------|------|
| PointAccount | point_accounts | 积分账户 |
| PointTransaction | point_transactions | 积分交易 |
| PointRule | point_rules | 积分规则 |
| InvitationCode | invitation_codes | 邀请码 |
| InvitationRecord | invitation_records | 邀请记录 |
| DeviceTakeoverRequest | device_takeover_requests | 设备接管申请 |

---

## 5. API接口设计

### 5.1 API规范

- **基础路径**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON
- **字符编码**: UTF-8

### 5.2 统一响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}

// 分页响应
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 5.3 HTTP状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 5.4 核心API端点列表

```yaml
# 认证相关
POST   /auth/login              # 用户登录
POST   /auth/register           # 用户注册
GET    /auth/me                 # 获取当前用户

# 设备护照
GET    /scan/:code              # 公开扫描
POST   /passports               # 创建护照
GET    /passports               # 护照列表
GET    /passports/:id           # 护照详情
PATCH  /passports/:id/status    # 更新状态

# 专家管理
GET    /experts                 # 专家列表
GET    /experts/:id             # 专家详情
PATCH  /experts/:id/work-status # 状态切换
POST   /experts/:id/generate-passport # 生成护照

# 服务请求
POST   /service-requests        # 创建请求
GET    /service-requests        # 请求列表
GET    /service-requests/public # 公开请求
POST   /service-requests/:id/publish # 发布
POST   /service-requests/:id/apply   # 申请接单

# 服务记录
GET    /expert-rating/service-records/expert/:id  # 专家服务记录
POST   /expert-rating/service-records/:id/start   # 开始服务
POST   /expert-rating/service-records/:id/complete # 完成服务
POST   /expert-rating/service-records/:id/confirm  # 确认完成

# 评价
POST   /expert-rating/reviews   # 提交评价
GET    /expert-rating/reviews/expert/:id # 专家评价

# 积分
GET    /points/my               # 我的积分
GET    /points/transactions     # 积分记录
GET    /admin/point-rules       # 规则列表
POST   /admin/point-rules       # 创建规则

# 邀请
POST   /invitations/codes       # 生成邀请码
GET    /invitations/codes       # 我的邀请码
GET    /invitations/records     # 邀请记录
```

---

## 6. 前端架构

### 6.1 页面路由结构

```
/                           # 首页
/login                      # 登录
/register                   # 注册入口
/register/company           # 公司注册
/register/expert            # 专家注册
/scan                       # 扫码页面
/scan/:code                 # 设备公开信息
/service-request            # 服务请求表单

# 受保护路由 (需登录)
/dashboard                  # 管理仪表板
/passports                  # 设备护照列表
/passports/create           # 创建护照
/passports/:id              # 护照详情
/expert-passports           # 专家护照管理
/service-orders             # 服务工单列表
/service-orders/:id         # 工单详情
/service-requests           # 服务请求管理
/registrations              # 注册审核
/point-rules                # 积分规则
/device-takeover            # 设备接管审核

# 专家路由
/expert                     # 专家仪表板
/expert/dashboard           # 专家首页
/expert/profile             # 专家资料
/expert/passport            # 专家护照
/expert/service-records     # 服务记录列表
/expert/service-records/:id # 服务记录详情
/expert/matches             # 匹配结果
/expert/service-hall        # 服务大厅

# 客户路由
/my-service-records         # 我的服务记录

# 市场路由
/marketplace                # 市场首页
/marketplace/products       # 产品列表
/marketplace/products/:id   # 产品详情
/marketplace/rfqs           # RFQ列表
/marketplace/rfqs/:id       # RFQ详情

# 供应商路由
/supplier/products          # 我的产品
/supplier/products/publish  # 发布产品
/supplier/matches           # 匹配结果

# 买家路由
/buyer/rfqs                 # 我的RFQ
/buyer/rfqs/create          # 创建RFQ
/buyer/matches              # 匹配结果

# 平台功能路由
/my-points                  # 我的积分
/my-invitations             # 我的邀请
/device-takeover/apply      # 设备接管申请
```

### 6.2 状态管理

```typescript
// Zustand Store 结构
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}

// React Query 数据获取
const { data, isLoading } = useQuery({
  queryKey: ['service-records', expertId],
  queryFn: () => api.getServiceRecords(expertId),
});
```

### 6.3 组件层次

```
App
├── PublicLayout
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── Scan
│   └── ServiceRequest
│
└── DashboardLayout (Protected)
    ├── Sidebar
    ├── Header
    └── Content
        ├── Admin Pages
        ├── Expert Pages
        ├── Customer Pages
        ├── Supplier Pages
        └── Buyer Pages
```

---

## 7. 安全架构

### 7.1 认证机制

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JWT认证流程                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   客户端                    服务端                    数据库         │
│     │                        │                        │             │
│     │  POST /auth/login      │                        │             │
│     │  {email, password}     │                        │             │
│     │───────────────────────▶│                        │             │
│     │                        │  验证用户              │             │
│     │                        │───────────────────────▶│             │
│     │                        │◀───────────────────────│             │
│     │                        │  生成JWT Token         │             │
│     │  {token, user}         │                        │             │
│     │◀───────────────────────│                        │             │
│     │                        │                        │             │
│     │  GET /api/protected    │                        │             │
│     │  Authorization: Bearer │                        │             │
│     │───────────────────────▶│                        │             │
│     │                        │  验证Token             │             │
│     │                        │  解析用户信息          │             │
│     │  {data}                │                        │             │
│     │◀───────────────────────│                        │             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 权限控制 (RBAC)

```typescript
// 角色权限矩阵
const permissions = {
  PUBLIC: ['scan:read'],
  CUSTOMER: ['passport:read', 'service-request:create', 'review:create'],
  EXPERT: ['service-request:apply', 'service-record:manage'],
  OPERATOR: ['passport:create', 'service-order:manage'],
  ADMIN: ['*'],
};
```

### 7.3 数据安全

- 密码使用 bcrypt 加密存储
- 敏感数据传输使用 HTTPS
- JWT Token 设置过期时间
- API 请求频率限制
- SQL 注入防护 (TypeORM 参数化查询)
- XSS 防护 (输入验证和输出编码)

---

## 8. 部署架构

### 8.1 开发环境

```bash
# 环境要求
- Node.js >= 18.x
- pnpm >= 9.x
- PostgreSQL >= 16.x
- Redis >= 7.x

# 启动命令
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm db:migrate       # 数据库迁移
pnpm db:seed          # 填充种子数据
```

### 8.2 生产环境

```
┌─────────────────────────────────────────────────────────────────────┐
│                        生产部署架构                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    ┌─────────────────┐                             │
│                    │   CDN / DNS     │                             │
│                    └────────┬────────┘                             │
│                             │                                       │
│                    ┌────────▼────────┐                             │
│                    │     Nginx       │                             │
│                    │  (负载均衡/SSL) │                             │
│                    └────────┬────────┘                             │
│                             │                                       │
│              ┌──────────────┼──────────────┐                       │
│              │              │              │                       │
│     ┌────────▼────────┐    │     ┌────────▼────────┐              │
│     │   Web Server    │    │     │   API Server    │              │
│     │   (静态资源)     │    │     │   (NestJS)      │              │
│     └─────────────────┘    │     └────────┬────────┘              │
│                            │              │                        │
│                            │     ┌────────▼────────┐              │
│                            │     │     Redis       │              │
│                            │     │   (缓存/会话)   │              │
│                            │     └─────────────────┘              │
│                            │              │                        │
│                    ┌───────▼───────┐     │                        │
│                    │  PostgreSQL   │◀────┘                        │
│                    │   (主数据库)   │                              │
│                    └───────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Docker部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
    depends_on:
      - db
      - redis

  web:
    build: ./apps/web
    ports:
      - "80:80"

  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 附录

### A. 护照码格式规范

**设备护照码**: `DP-{COMPANY}-{YYMM}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}`

| 字段 | 长度 | 说明 | 示例 |
|------|------|------|------|
| DP | 2 | 固定前缀 | DP |
| COMPANY | 3 | 公司代码 | MED |
| YYMM | 4 | 年月 | 2601 |
| PRODUCT | 2-3 | 产品类型 | PLC |
| ORIGIN | 2 | 产地代码 | DE |
| SEQUENCE | 6 | 序列号 | 000001 |
| CHECKSUM | 2 | 校验码 | A7 |

**专家护照码**: `EP-{TYPE}{LEVEL}-{YYMM}-{COUNTRY}-{SEQUENCE}-{CHECKSUM}`

| 字段 | 长度 | 说明 | 示例 |
|------|------|------|------|
| EP | 2 | 固定前缀 | EP |
| TYPE | 2 | 专业类型 | TE (技术) |
| LEVEL | 2 | 技能等级 | PL (铂金) |
| YYMM | 4 | 年月 | 2601 |
| COUNTRY | 2 | 国家代码 | CN |
| SEQUENCE | 6 | 序列号 | 000001 |
| CHECKSUM | 2 | 校验码 | 3A |

### B. 状态枚举定义

**设备状态 (DeviceStatus)**:
- CREATED, PROCURED, IN_QC, QC_PASSED, IN_ASSEMBLY
- IN_TESTING, TEST_PASSED, PACKAGED, IN_TRANSIT
- DELIVERED, IN_SERVICE, MAINTENANCE, DECOMMISSIONED

**专家工作状态 (ExpertWorkStatus)**:
- RUSHING (抢单中)
- IDLE (空闲)
- BOOKED (已预定)
- IN_SERVICE (服务中)
- OFF_DUTY (休息中)

**服务记录状态 (ServiceRecordStatus)**:
- PENDING (待开始)
- IN_PROGRESS (进行中)
- COMPLETED (已完成)
- CANCELLED (已取消)
- DISPUTED (争议中)

---

**文档维护**: 技术部
**最后更新**: 2026-02-01
