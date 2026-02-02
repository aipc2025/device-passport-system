# 项目待完成编程工作清单

生成时间：2026-02-02
当前状态：核心功能完成 75%，测试覆盖率 11.5%，存在编译错误

---

## 🔴 阻塞性问题（必须修复才能部署）

### 1. TypeScript 编译错误修复 (HIGH PRIORITY)

**影响范围：** 89+ 编译错误，项目无法构建

#### 1.1 模块导入路径错误 (50+ 错误)

**问题描述：** 多个模块使用了错误的相对路径导入实体类

**需要修复的文件：**
```
src/modules/analytics/analytics.module.ts
src/modules/analytics/analytics.service.ts
src/modules/analytics/analytics.controller.ts
src/modules/export/export.module.ts
src/modules/export/export.service.ts
src/modules/export/export.controller.ts
src/modules/websocket/websocket.module.ts
src/modules/websocket/websocket.gateway.ts
src/modules/websocket/notification.service.ts
src/modules/location/location.module.ts
src/modules/device-takeover/device-takeover.module.ts
```

**错误示例：**
```typescript
// ❌ 错误
import { DevicePassport } from '../entities/device-passport.entity';
import { User } from '../entities/user.entity';

// ✅ 正确
import { DevicePassport, User } from '../../database/entities';
```

**修复策略：**
- 将所有 `'../entities/*.entity'` 改为 `'../../database/entities'`
- 使用集中的 barrel export (已存在于 `src/database/entities/index.ts`)

**工作量估计：** 1-2 小时

---

#### 1.2 缺失的依赖包

**问题：** `@nestjs/terminus` 包未安装

**文件：**
- `src/health/health.controller.ts`
- `src/health/health.module.ts`

**修复命令：**
```bash
cd apps/api
pnpm add @nestjs/terminus @nestjs/axios
pnpm add -D @types/compression
```

**工作量估计：** 10 分钟

---

#### 1.3 TypeScript 严格模式错误

**问题：** Response 对象可能为 undefined

**文件：** `src/modules/export/export.controller.ts` (10+ 处)

**错误示例：**
```typescript
// ❌ 错误
@Res() res: Response

// ✅ 修复
@Res() res?: Response  // 或添加 non-null assertion
```

**工作量估计：** 30 分钟

---

#### 1.4 WebSocket 模块类型错误

**问题：** AuthSocket 接口缺少属性定义

**文件：** `src/modules/websocket/websocket.gateway.ts`

**错误：**
- Property 'join' does not exist on type 'AuthSocket'
- Property 'leave' does not exist on type 'AuthSocket'
- Property 'id' does not exist on type 'AuthSocket'

**修复：** 扩展 AuthSocket 接口定义
```typescript
interface AuthSocket extends Socket {
  userId?: string;
  id: string;
  join(room: string): void;
  leave(room: string): void;
}
```

**工作量估计：** 1 小时

---

### 2. WebSocket 模块完善 (Task #20)

**当前状态：** 基本功能实现，但有编译错误和安全问题

**需要完成：**

#### 2.1 修复编译错误（如上 1.1, 1.4）

#### 2.2 添加消息验证
```typescript
// 需要添加
class MessageDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsEnum(MessageType)
  type: MessageType;
}
```

#### 2.3 添加速率限制
```typescript
// 防止 WebSocket 消息洪泛
@WebSocketThrottle({ limit: 10, ttl: 1000 })
```

#### 2.4 改进错误处理
- 添加全局异常过滤器
- 统一错误响应格式
- 添加重连逻辑

#### 2.5 添加单元测试
- 连接/断开测试
- 消息发送/接收测试
- 房间订阅测试
- 错误处理测试

**工作量估计：** 4-6 小时

---

### 3. 数据库索引优化 (Task #21 - CRITICAL for Performance)

**影响：** 查询性能，生产环境必需

**需要添加的索引：**

```sql
-- Device Passport 表
CREATE INDEX idx_device_passport_supplier_id ON device_passport(supplier_id);
CREATE INDEX idx_device_passport_customer_id ON device_passport(customer_id);
CREATE INDEX idx_device_passport_status ON device_passport(status);

-- Service Request 表
CREATE INDEX idx_service_request_status ON service_request(status);
CREATE INDEX idx_service_request_published_at ON service_request(published_at);

-- Expert Service Record 表
CREATE INDEX idx_expert_service_record_expert_id ON expert_service_record(expert_id);

-- Lifecycle Event 表
CREATE INDEX idx_lifecycle_event_passport_id ON lifecycle_event(passport_id);
CREATE INDEX idx_lifecycle_event_created_at ON lifecycle_event(created_at);

-- Inquiry 表
CREATE INDEX idx_inquiry_status ON inquiry(status);
CREATE INDEX idx_inquiry_buyer_org_id ON inquiry(buyer_org_id);
```

**实现方式：**
1. 创建 TypeORM 迁移文件
2. 在实体类添加 `@Index()` 装饰器
3. 运行迁移

**工作量估计：** 2-3 小时

---

## 🟡 高优先级工作（影响质量和稳定性）

### 4. 单元测试扩展 (Task #22)

**当前覆盖率：** 11.5% (3/26 模块有测试)

**已测试模块：**
- ✅ auth.service (24 tests)
- ✅ auth.controller (21 tests)
- ✅ jwt-auth.guard (11 tests)
- ✅ location.service (基础测试)
- ✅ passport-code.service (基础测试)
- ✅ scan.service (基础测试)

**需要添加测试的核心模块：** (按优先级排序)

#### 4.1 关键业务逻辑 (HIGH)
- [ ] `passport.service.ts` - 设备护照 CRUD
- [ ] `lifecycle.service.ts` - 生命周期管理
- [ ] `service-order.service.ts` - 服务订单
- [ ] `service-request.service.ts` - 服务请求
- [ ] `expert-matching.service.ts` - 专家匹配算法
- [ ] `expert.service.ts` - 专家管理
- [ ] `registration.service.ts` - 注册流程

#### 4.2 数据处理模块 (MEDIUM)
- [ ] `analytics.service.ts` - 数据分析
- [ ] `export.service.ts` - 数据导出
- [ ] `point.service.ts` - 积分系统
- [ ] `expert-rating.service.ts` - 评分系统

#### 4.3 辅助功能模块 (LOW)
- [ ] `marketplace.service.ts` - 市场功能
- [ ] `inquiry.service.ts` - 询价
- [ ] `saved.service.ts` - 收藏功能
- [ ] `invitation.service.ts` - 邀请
- [ ] `device-takeover.service.ts` - 设备接管
- [ ] `upload.service.ts` - 文件上传

**目标覆盖率：** 60%+

**工作量估计：** 20-30 小时（每个服务 1-2 小时）

---

### 5. E2E 测试 (Task #17)

**当前状态：** 0 个 E2E 测试

**需要测试的关键流程：**

#### 5.1 认证流程
- [ ] 用户注册 → 登录 → 获取 token → 访问受保护端点
- [ ] Token 刷新流程
- [ ] 登录失败 → 速率限制触发

#### 5.2 设备护照完整生命周期
- [ ] 创建设备 → 扫描 → 更新状态 → 添加生命周期事件 → 查询历史
- [ ] 多角色访问权限验证（admin/operator/customer/engineer）

#### 5.3 服务请求流程
- [ ] 发布服务请求 → 专家匹配 → 接单 → 完成 → 评分
- [ ] WebSocket 实时通知验证

#### 5.4 专家注册审批流程
- [ ] 专家注册 → 管理员审批 → 生成护照码 → 发布服务

#### 5.5 数据导出流程
- [ ] 导出 Excel → 下载验证
- [ ] 导出 CSV → UTF-8 BOM 验证
- [ ] QR 码批量生成

**使用工具：**
- Supertest (API 测试)
- Playwright (前端 E2E)

**工作量估计：** 15-20 小时

---

### 6. 前端单元测试 (Task #7 的一部分)

**当前状态：** 0 个前端测试

**需要测试的组件：** (优先级高的)

#### 6.1 核心组件
- [ ] `DevicePassportCard.tsx` - 设备卡片展示
- [ ] `PassportQRCode.tsx` - QR 码生成
- [ ] `LifecycleTimeline.tsx` - 时间轴
- [ ] `ServiceRequestCard.tsx` - 服务请求卡片
- [ ] `ExpertCard.tsx` - 专家卡片

#### 6.2 表单组件
- [ ] `DeviceForm.tsx` - 设备表单
- [ ] `ServiceRequestForm.tsx` - 服务请求表单
- [ ] `ExpertRegistrationForm.tsx` - 专家注册

#### 6.3 Hooks
- [ ] `useDevicePassport.ts` - 设备数据 hook
- [ ] `useAuth.ts` - 认证 hook
- [ ] `usePWA.ts` - PWA 功能
- [ ] `useWebSocket.ts` - WebSocket 连接

**测试框架：**
- Vitest + React Testing Library

**工作量估计：** 10-15 小时

---

## 🟢 功能增强（非阻塞，提升用户体验）

### 7. 移动端适配优化

**已完成：**
- ✅ PWA 基础配置
- ✅ Service Worker
- ✅ 响应式布局

**待优化：**
- [ ] 离线功能完善（缓存策略优化）
- [ ] 推送通知权限请求流程
- [ ] iOS Safari 兼容性测试
- [ ] 触摸手势优化
- [ ] 移动端性能优化（代码分割、懒加载）

**工作量估计：** 5-8 小时

---

### 8. 实时功能增强

**已实现：**
- ✅ WebSocket 基础连接
- ✅ 11 种通知类型
- ✅ 房间订阅机制

**待增强：**
- [ ] 消息持久化（未读消息存储）
- [ ] 消息已读/未读状态
- [ ] 消息推送历史查询 API
- [ ] 在线状态显示
- [ ] 输入状态提示（typing indicator）
- [ ] 消息重发机制

**工作量估计：** 6-10 小时

---

### 9. 性能监控和日志

**当前状态：** 基础日志，无监控

**需要添加：**

#### 9.1 应用监控
- [ ] 集成 APM 工具（如 New Relic, Datadog, 或 Sentry）
- [ ] 自定义 Metrics（请求耗时、数据库查询时间）
- [ ] 错误追踪和告警

#### 9.2 日志优化
- [ ] 结构化日志（JSON 格式）
- [ ] 日志等级配置（dev: debug, prod: warn）
- [ ] 敏感信息脱敏（密码、token）
- [ ] 日志轮转和归档

#### 9.3 性能分析
- [ ] 慢查询监控
- [ ] API 响应时间分布
- [ ] 内存泄漏检测
- [ ] 数据库连接池监控

**工作量估计：** 8-12 小时

---

### 10. 文档完善

**已有文档：**
- ✅ CLAUDE.md - 项目概述
- ✅ MAP_FEATURES.md - 地图功能
- ✅ PWA_MOBILE.md - PWA 指南
- ✅ WEBSOCKET_GUIDE.md - WebSocket 文档
- ✅ RATE_LIMITING.md - 速率限制
- ✅ FINAL_SUMMARY.md - 项目总结

**缺失文档：**
- [ ] API 文档完善（Swagger 描述补充）
- [ ] 数据库设计文档（ER 图、字段说明）
- [ ] 部署文档（生产环境部署步骤）
- [ ] 故障排查指南
- [ ] 开发者贡献指南

**工作量估计：** 6-10 小时

---

## 🔵 安全加固（生产环境必需）

### 11. 安全增强

**已实现：**
- ✅ JWT 认证
- ✅ 密码哈希 (bcrypt)
- ✅ 速率限制
- ✅ 输入验证
- ✅ Helmet.js 安全头
- ✅ CORS 配置

**待完成：**

#### 11.1 高优先级
- [ ] CSRF 保护（Cookie-based CSRF tokens）
- [ ] SQL 注入防护审计（ORM 使用检查）
- [ ] XSS 防护审计（前端输出转义）
- [ ] 敏感操作审计日志（登录、权限变更、数据导出）
- [ ] 账户锁定机制（失败登录次数限制）

#### 11.2 中优先级
- [ ] 内容安全策略 (CSP)
- [ ] API 密钥管理（环境变量验证）
- [ ] 文件上传安全（类型检查、大小限制、病毒扫描）
- [ ] 依赖漏洞扫描（npm audit 定期执行）

**工作量估计：** 10-15 小时

---

### 12. 权限系统完善

**当前实现：** 基础 RBAC（6 个角色）

**待增强：**
- [ ] 细粒度权限控制（资源级别权限）
- [ ] 权限继承和组合
- [ ] 动态权限加载
- [ ] 权限缓存（Redis）
- [ ] 权限审计日志

**工作量估计：** 8-12 小时

---

## 📊 数据质量和完整性

### 13. 数据验证增强

**需要添加：**
- [ ] 业务规则验证（如：设备不能跳过 QC 状态直接到 IN_SERVICE）
- [ ] 跨字段验证（如：结束日期必须晚于开始日期）
- [ ] 数据一致性检查（定期任务）
- [ ] 孤儿数据清理脚本

**工作量估计：** 4-6 小时

---

### 14. 数据迁移和种子数据

**当前状态：** 基础种子数据

**待完善：**
- [ ] 生产级种子数据（更多测试场景）
- [ ] 数据迁移脚本（版本升级）
- [ ] 数据备份和恢复脚本
- [ ] 数据导入工具（批量导入 Excel）

**工作量估计：** 6-8 小时

---

## 🎨 用户体验优化

### 15. UI/UX 改进

**待优化：**
- [ ] 加载状态统一（骨架屏）
- [ ] 错误提示优化（用户友好的错误信息）
- [ ] 成功反馈动画
- [ ] 表单验证实时反馈
- [ ] 深色模式完善（所有页面适配）
- [ ] 无障碍访问 (ARIA 标签)

**工作量估计：** 10-15 小时

---

### 16. 国际化 (i18n)

**当前状态：** 仅中文

**需要支持：**
- [ ] 英文版本
- [ ] 前端国际化框架集成 (i18next)
- [ ] 后端错误消息国际化
- [ ] 日期/时间格式本地化
- [ ] 货币格式本地化

**工作量估计：** 15-20 小时

---

## 🚀 DevOps 和运维

### 17. CI/CD 完善

**已实现：**
- ✅ GitHub Actions 基础配置

**待完善：**
- [ ] 自动化测试集成（PR 触发）
- [ ] 代码覆盖率报告
- [ ] 自动化部署（staging/production）
- [ ] Docker 镜像优化和多阶段构建
- [ ] 版本标签自动化

**工作量估计：** 6-10 小时

---

### 18. 环境配置管理

**待完善：**
- [ ] 配置文件模板化
- [ ] 环境变量验证（启动时检查必需变量）
- [ ] 配置文档生成
- [ ] Secrets 管理（Vault 或 AWS Secrets Manager）

**工作量估计：** 4-6 小时

---

## 🔧 技术债务

### 19. 代码重构

**已知问题：**
- [ ] 部分文件过大（超过 300 行需拆分）
- [ ] 重复代码提取（DRY 原则）
- [ ] 魔法数字替换为常量
- [ ] 类型定义完善（减少 `any` 使用）
- [ ] 注释和文档字符串补充

**工作量估计：** 15-20 小时

---

### 20. 依赖更新和审计

**需要定期执行：**
- [ ] 依赖版本更新（minor/patch）
- [ ] 漏洞修复（npm audit fix）
- [ ] 弃用 API 替换
- [ ] 许可证合规检查

**工作量估计：** 2-3 小时/月

---

## 📈 总结

### 工作分类统计

| 类别 | 任务数 | 预估工时 | 优先级 |
|------|--------|----------|--------|
| **阻塞性问题** | 3 | 8-12h | 🔴 CRITICAL |
| **高优先级** | 6 | 73-105h | 🟡 HIGH |
| **功能增强** | 6 | 45-65h | 🟢 MEDIUM |
| **安全加固** | 2 | 18-27h | 🔵 HIGH |
| **数据质量** | 2 | 10-14h | 🟢 MEDIUM |
| **UX 优化** | 2 | 25-35h | 🟢 LOW |
| **DevOps** | 2 | 10-16h | 🟡 MEDIUM |
| **技术债务** | 2 | 17-23h | 🟢 LOW |
| **总计** | **25** | **206-297h** | - |

### 最小可部署版本 (MVP) 必须完成

优先完成以下任务才能部署到生产环境：

1. ✅ **修复所有编译错误** (Task #1.1-1.4) - 8-12h
2. ✅ **添加数据库索引** (Task #21/#3) - 2-3h
3. ✅ **WebSocket 模块修复** (Task #20/#2) - 4-6h
4. ✅ **关键业务逻辑测试** (Task #22/#4.1) - 12-15h
5. ✅ **安全加固高优先级项** (Task #11.1) - 8-12h
6. ✅ **E2E 核心流程测试** (Task #17/#5.1-5.2) - 6-8h

**MVP 总工时：40-56 小时 (约 1-1.5 周全职开发)**

### 生产就绪版本建议完成

在 MVP 基础上，再完成：

- 所有单元测试 (60%+ 覆盖率)
- 完整 E2E 测试套件
- 性能监控和日志系统
- 完整的安全审计
- 文档完善

**额外工时：100-150 小时 (约 2.5-4 周)**

---

## 📝 备注

1. **工时估算** 基于单个高级开发者的工作效率
2. **优先级** 可根据实际业务需求调整
3. **并行开发** 部分任务可由多人同时进行
4. **持续集成** 建议逐步完成，而非全部完成后再部署

**最后更新：** 2026-02-02
**文档维护者：** Claude Code Agent
