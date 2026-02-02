# 功能验证和完善计划 | Feature Verification & Enhancement Plan

**创建时间**: 2026-02-02
**当前状态**: API服务器已修复，核心测试通过 (113/113)

---

## ✅ 已完成验证

### 1. 核心模块测试 (113 tests passing)
- ✅ Authentication (auth.service + auth.controller)
- ✅ Service Request (29 tests)
- ✅ Expert Matching (28 tests)
- ✅ Location Service (8 tests)
- ✅ JWT Guard

---

## 🔄 需要验证的功能模块

### 高优先级 (关键业务功能)

#### 1. 专家管理系统 ⭐⭐⭐
**文件**: `apps/api/src/modules/expert/expert.service.ts`
**功能**:
- [ ] 专家资料注册和审核
- [ ] 专家代码生成 (EP-{TYPE}-{YYMM}-{SEQ}-{CHECK})
- [ ] 工作状态管理 (IDLE, BUSY, RUSHING, OFF_DUTY)
- [ ] 会员等级系统 (STANDARD, SILVER, GOLD, PLATINUM, DIAMOND)
- [ ] 信用积分系统

**验证方法**:
```bash
# API测试
curl -X POST http://localhost:3000/api/v1/expert/register \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}'

# 前端测试
- 登录 expert@luna.top
- 完善专家资料
- 测试状态切换
```

#### 2. 专家评分系统 ⭐⭐⭐
**文件**: `apps/api/src/modules/expert-rating/expert-rating.service.ts`
**功能**:
- [ ] 服务完成后评分
- [ ] 评分统计 (avgRating, totalReviews)
- [ ] 评论管理
- [ ] 评分权限验证

**验证方法**:
```bash
# 完成服务后评分
POST /api/v1/expert-rating/rate
{
  "expertId": "...",
  "serviceOrderId": "...",
  "rating": 5,
  "comment": "..."
}
```

#### 3. 设备护照管理 ⭐⭐⭐
**文件**: `apps/api/src/modules/passport/passport.service.ts`
**功能**:
- [ ] 护照创建和代码生成
- [ ] 二维码生成
- [ ] 护照查询和列表
- [ ] 状态更新
- [ ] 权限控制

**验证方法**:
```bash
# 创建护照
POST /api/v1/passports
{
  "productLine": "PLC",
  "originCode": "CN",
  "deviceName": "Siemens S7-1500",
  ...
}

# 扫描护照
GET /api/v1/scan/{passportCode}
```

#### 4. 服务订单系统 ⭐⭐
**文件**: `apps/api/src/modules/service-order/service-order.service.ts`
**功能**:
- [ ] 订单创建
- [ ] 工程师分配
- [ ] 订单状态流转
- [ ] 完成确认
- [ ] 工作记录

**验证方法**:
- 从服务请求创建订单
- 分配工程师
- 更新状态至完成
- 验证通知发送

---

### 中优先级 (增强功能)

#### 5. 通知系统 ⭐⭐
**文件**: `apps/api/src/modules/websocket/notification.service.ts`
**功能**:
- [ ] WebSocket连接管理
- [ ] 实时通知推送
- [ ] 通知已读标记
- [ ] 频道订阅管理
- [ ] 用户/角色广播

**验证方法**:
```javascript
// 前端WebSocket连接
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt_token' }
});
socket.emit('subscribe', { channel: 'user:123' });
```

#### 6. 文件上传系统 ⭐⭐
**文件**: `apps/api/src/modules/upload/upload.service.ts`
**功能**:
- [ ] 图片上传 (JPG, PNG, max 10MB)
- [ ] 文档上传 (PDF, DOC, DOCX)
- [ ] 文件分类存储
- [ ] 文件元数据管理

**验证方法**:
```bash
# 上传文件
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@test.jpg" \
  -F "type=profile_photo"
```

#### 7. 数据分析与报表 ⭐⭐
**文件**: `apps/api/src/modules/analytics/analytics.service.ts`
**功能**:
- [ ] 仪表板统计
- [ ] 设备状态分布
- [ ] 服务请求统计
- [ ] 专家统计分析
- [ ] 数据导出 (Excel/CSV)

**验证方法**:
```bash
# 获取仪表板数据
GET /api/v1/analytics/dashboard

# 导出设备列表
GET /api/v1/export/passports?format=excel
```

#### 8. 地图和位置服务 ⭐
**文件**: `apps/api/src/modules/location/location.service.ts`
**状态**: ✅ 已修复编译错误
**功能**:
- [ ] 附近专家搜索
- [ ] 附近服务请求
- [ ] 附近设备查询
- [ ] 地理编码
- [ ] 距离计算

**验证方法**:
```bash
# 查找附近专家
GET /api/v1/location/experts/nearby?lat=31.2304&lng=121.4737&radius=50
```

---

### 低优先级 (辅助功能)

#### 9. 生命周期跟踪
**文件**: `apps/api/src/modules/lifecycle/lifecycle.service.ts`
**功能**:
- [ ] 设备生命周期事件记录
- [ ] 状态变更追踪
- [ ] 位置变更记录
- [ ] 区块链哈希（预留）

#### 10. 邀请系统
**文件**: `apps/api/src/modules/invitation/invitation.service.ts`
**功能**:
- [ ] 邀请码生成
- [ ] 邀请关系追踪
- [ ] 积分奖励

#### 11. 积分系统
**文件**: `apps/api/src/modules/point/point.service.ts`
**功能**:
- [ ] 积分获取
- [ ] 积分消费
- [ ] 积分历史

---

## 🧪 测试验证清单

### API端点测试

#### 认证相关
- [x] POST /api/v1/auth/register - 用户注册
- [x] POST /api/v1/auth/login - 用户登录
- [x] POST /api/v1/auth/refresh - Token刷新
- [ ] GET /api/v1/auth/profile - 获取个人资料

#### 设备护照
- [ ] POST /api/v1/passports - 创建护照
- [ ] GET /api/v1/passports - 护照列表
- [ ] GET /api/v1/passports/:id - 护照详情
- [ ] PATCH /api/v1/passports/:id - 更新护照
- [ ] GET /api/v1/scan/:code - 扫描护照（公开）

#### 服务请求
- [x] POST /api/v1/service-requests - 创建请求 (已测试)
- [x] POST /api/v1/service-requests/:id/publish - 发布请求
- [x] POST /api/v1/service-requests/:id/apply - 专家申请
- [x] POST /api/v1/service-requests/:id/approve - 批准申请
- [x] POST /api/v1/service-requests/:id/complete - 完成服务

#### 专家管理
- [ ] POST /api/v1/experts/register - 专家注册
- [ ] GET /api/v1/experts/profile - 专家资料
- [ ] PATCH /api/v1/experts/profile - 更新资料
- [ ] PATCH /api/v1/experts/status - 更新工作状态
- [ ] GET /api/v1/experts/nearby - 附近专家

#### 专家匹配
- [x] POST /api/v1/expert-matching/match/:requestId - 匹配专家 (已测试)
- [ ] GET /api/v1/expert-matching/suggestions - 匹配建议
- [ ] POST /api/v1/expert-matching/rushing - 抢单模式

#### 通知系统
- [ ] WebSocket连接: ws://localhost:3000
- [ ] 订阅频道: user:{userId}, role:{role}
- [ ] 发送通知
- [ ] 标记已读

#### 文件上传
- [ ] POST /api/v1/upload - 上传文件
- [ ] GET /api/v1/upload/:filename - 获取文件

#### 数据导出
- [ ] GET /api/v1/export/passports - 导出设备护照
- [ ] GET /api/v1/export/service-orders - 导出服务订单
- [ ] GET /api/v1/export/lifecycle-events - 导出生命周期

---

## 🔧 需要修复的测试文件

### 1. Scan Service Tests
**文件**: `apps/api/src/modules/scan/scan.service.spec.ts`
**问题**: Mock配置不正确
**状态**: ⚠️ 需要重构

### 2. Passport Code Service Tests
**文件**: `apps/api/src/modules/passport/passport-code.service.spec.ts`
**问题**: 序列计数器状态问题
**状态**: ⚠️ 部分通过

---

## 📊 性能验证

### 负载测试
- [ ] 并发用户登录 (50 users)
- [ ] 批量设备创建 (100 devices)
- [ ] 专家匹配性能 (1000 experts)
- [ ] WebSocket连接数 (100 connections)

### 响应时间
- [ ] API响应 < 100ms (平均)
- [ ] 数据库查询 < 50ms (平均)
- [ ] WebSocket延迟 < 20ms

---

## 🔐 安全验证

- [x] JWT认证 ✅
- [x] 密码加密 (bcrypt) ✅
- [x] 速率限制 ✅
- [x] CORS配置 ✅
- [x] 输入验证 ✅
- [ ] XSS防护测试
- [ ] SQL注入测试
- [ ] 权限边界测试

---

## 📱 前端功能验证

### 用户界面
- [ ] 登录页面
- [ ] 仪表板
- [ ] 设备管理
- [ ] 服务请求管理
- [ ] 专家管理
- [ ] 地图视图
- [ ] 通知中心

### 移动端适配
- [ ] 响应式布局
- [ ] 触摸交互
- [ ] 离线支持（PWA）
- [ ] 摄像头扫码

---

## 📝 下一步行动计划

### 立即执行 (今天)
1. ✅ 修复所有TypeScript编译错误
2. ✅ 确保API服务器可启动
3. [ ] 验证登录功能
4. [ ] 测试设备护照创建
5. [ ] 测试专家注册流程

### 短期 (本周)
1. [ ] 完善专家管理功能测试
2. [ ] 添加专家评分系统测试
3. [ ] 验证通知系统
4. [ ] 测试文件上传
5. [ ] 修复失败的测试文件

### 中期 (下周)
1. [ ] E2E测试套件
2. [ ] 性能测试
3. [ ] 安全测试
4. [ ] 移动端测试
5. [ ] 用户验收测试

---

## 🎯 成功标准

### MVP标准 (最小可行产品)
- ✅ 用户能登录系统
- [ ] 管理员能创建设备护照
- [ ] 客户能扫描护照查看信息
- [ ] 客户能创建服务请求
- [ ] 专家能申请服务
- [ ] 系统能匹配专家
- [ ] 服务完成后能评分

### 完整版标准
- [ ] 所有核心功能正常运行
- [ ] 测试覆盖率 > 60%
- [ ] API响应时间 < 100ms
- [ ] 支持50+并发用户
- [ ] 移动端完全适配
- [ ] 实时通知正常
- [ ] 数据导出功能正常

---

**下一步**: 开始系统功能验证，从登录测试开始！
