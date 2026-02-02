# 更新日志 | Changelog

本文档记录设备护照系统的所有重要变更。
All notable changes to the Device Passport System will be documented in this file.

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)

---

## [1.0.0] - 2026-02-02

### 🎉 首次发布 | Initial Release

设备护照系统 1.0.0 版本正式发布！

### ✨ 新增功能 | Added

#### 核心功能
- **设备护照管理系统**
  - 设备护照创建和管理
  - 护照代码自动生成（格式：DP-{COMPANY}-{YEAR}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}）
  - 二维码生成和扫描
  - 设备生命周期跟踪
  - 设备状态管理（10+状态）

- **认证与授权系统**
  - JWT token认证
  - 多角色权限控制（ADMIN, OPERATOR, ENGINEER, QC_INSPECTOR, CUSTOMER）
  - 用户注册和登录
  - 密码加密存储
  - 刷新Token机制

- **服务请求与专家匹配系统**
  - 服务请求创建和发布
  - 专家申请和审核流程
  - 智能专家匹配算法
  - 服务状态全生命周期管理
  - 专家评分和评论系统

- **专家管理系统**
  - 专家资料注册
  - 专家认证和审核
  - 专家代码生成（EP-{TYPE}-{YYMM}-{SEQ}-{CHECK}）
  - 工作状态管理（IDLE, BUSY, RUSHING, OFFLINE）
  - 会员等级系统（STANDARD, SILVER, GOLD, PLATINUM）
  - 信用积分系统

- **文件上传系统**
  - 多文件类型支持（图片、PDF、Word）
  - 文件大小限制（10MB）
  - 文件分类存储
  - 文件元数据管理

- **实时通知系统**
  - WebSocket实时通知
  - 频道订阅/取消订阅
  - 通知已读标记
  - 用户特定通知
  - 角色广播通知

- **数据分析与报表**
  - 仪表板统计
  - 设备状态分布图
  - 服务请求统计
  - 专家统计分析
  - 数据导出（Excel/CSV）

- **地图集成**
  - 设备地理位置标记
  - 地图可视化
  - 位置搜索
  - GPS定位支持

#### API功能
- **RESTful API**
  - 完整的CRUD操作
  - 统一的错误处理
  - 请求验证
  - 响应格式标准化

- **Swagger API文档**
  - 交互式API文档
  - 在线测试功能
  - 参数说明
  - 响应示例

#### 前端功能
- **响应式设计**
  - 移动端适配
  - 平板适配
  - 桌面端优化

- **用户界面**
  - 现代化UI设计
  - Tailwind CSS样式
  - 组件化架构
  - 暗黑模式支持（预留）

### 🔒 安全功能 | Security

- **认证安全**
  - bcrypt密码哈希
  - JWT token过期机制
  - 刷新Token轮换

- **API安全**
  - 速率限制（短期/中期/长期）
  - CORS配置
  - Helmet安全头
  - 输入验证和清理

- **WebSocket安全**
  - JWT认证
  - 频道授权
  - 连接限制（每用户最多5个）
  - 连接超时（30秒无活动）
  - 心跳机制

- **数据安全**
  - 参数化查询（防SQL注入）
  - XSS防护
  - CSRF防护

### 🚀 性能优化 | Performance

- **数据库索引**
  - 17个数据库索引
  - 关键查询优化
  - 复合索引支持

- **缓存系统**
  - Redis缓存集成
  - 会话缓存
  - 数据缓存

- **连接管理**
  - 数据库连接池
  - WebSocket连接管理
  - 自动清理过期连接

### 📚 文档与工具 | Documentation & Tools

- **启动脚本**
  - `start-all.bat` - 一键启动所有服务
  - `start-server.bat` - 启动API服务器
  - `start-web.bat` - 启动Web前端
  - `stop-all.bat` - 停止所有服务
  - `check-services.bat` - 检查服务状态
  - `setup-firewall.bat` - 配置防火墙

- **文档**
  - README-CN.md - 中文使用说明
  - QUICK-START.md - 快速开始指南
  - START-GUIDE.md - 详细启动指南
  - TEST-ACCOUNTS.md - 测试账号文档
  - TESTING-CHECKLIST.md - 功能测试清单
  - CHANGELOG.md - 更新日志
  - CLAUDE.md - 项目开发文档

### 🧪 测试 | Testing

- **单元测试**
  - ServiceRequestService测试套件（29个测试）
  - AuthService测试
  - PassportCodeService测试

- **测试覆盖**
  - 核心业务逻辑覆盖
  - 错误处理测试
  - 权限控制测试

### 🛠️ 技术栈 | Tech Stack

#### 后端 | Backend
- NestJS 11.x
- TypeScript 5.x
- TypeORM 0.3.x
- PostgreSQL 16
- Redis 7
- JWT认证
- bcrypt密码加密
- Socket.IO WebSocket
- Multer文件上传
- ExcelJS数据导出

#### 前端 | Frontend
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- React Query
- Zustand状态管理
- React Router
- Axios HTTP客户端

#### 开发工具 | Dev Tools
- pnpm包管理器
- Turborepo monorepo
- ESLint代码检查
- Prettier代码格式化
- Docker容器化
- Docker Compose编排

### 📦 部署 | Deployment

- **Docker支持**
  - PostgreSQL容器
  - Redis容器
  - Adminer数据库管理

- **环境配置**
  - 开发环境配置
  - 生产环境配置
  - 环境变量管理

### 🔧 配置 | Configuration

- **局域网访问配置**
  - CORS跨域配置
  - 防火墙规则
  - IP地址配置（192.168.71.21）

- **API配置**
  - 端口：3000
  - API前缀：/api/v1
  - Swagger路径：/api/docs

- **Web配置**
  - 端口：5173
  - API连接配置
  - 环境变量

### 🌟 亮点功能 | Highlights

1. **完整的设备全生命周期管理**
   - 从创建到报废的完整追踪
   - 10+设备状态支持
   - 区块链集成预留

2. **智能专家匹配系统**
   - 基于技能、位置、评分的匹配
   - 工作状态实时管理
   - 抢单模式支持

3. **实时通知系统**
   - WebSocket实时推送
   - 频道授权和订阅管理
   - 连接自动清理

4. **强大的权限系统**
   - 基于角色的访问控制（RBAC）
   - 细粒度权限管理
   - 资源所有权验证

5. **企业级安全**
   - 多层安全防护
   - 速率限制
   - 全面的输入验证

### 🐛 已知问题 | Known Issues

1. **文件上传**
   - 首次上传可能需要手动创建 `apps/api/uploads` 目录
   - **解决方案**：运行 `mkdir apps\api\uploads`

2. **Adminer访问**
   - 使用Docker内部名称 `postgres` 而非IP地址

### 📝 注意事项 | Notes

- ⚠️ 测试账号密码：`DevTest2026!@#$`
- ⚠️ 生产环境必须更改所有默认密码
- ⚠️ 设置 `SEED_PASSWORD` 环境变量用于生产
- ⚠️ 此版本仅供局域网测试使用

### 👥 贡献者 | Contributors

- Claude Opus 4.5 (AI Assistant)
- 项目团队

---

## [未来计划] - Unreleased

### 计划功能 | Planned

#### 短期（1-2个月）
- [ ] E2E测试套件
- [ ] 移动端App（React Native）
- [ ] 更多单元测试
- [ ] 性能优化

#### 中期（3-6个月）
- [ ] 区块链集成
- [ ] 供应链管理模块
- [ ] 高级分析报表
- [ ] 多语言支持

#### 长期（6-12个月）
- [ ] 智能合约
- [ ] AI预测维护
- [ ] 物联网设备集成
- [ ] 第三方系统集成

---

## 版本规范 | Version Convention

### 语义化版本 | Semantic Versioning

`主版本号.次版本号.修订号` (MAJOR.MINOR.PATCH)

- **主版本号**：不兼容的API变更
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型 | Change Types

- `Added` - 新增功能
- `Changed` - 功能变更
- `Deprecated` - 即将废弃的功能
- `Removed` - 已删除的功能
- `Fixed` - Bug修复
- `Security` - 安全更新

---

## 联系方式 | Contact

- **项目仓库**: [GitHub Repository]
- **问题反馈**: [Issue Tracker]
- **文档**: [Documentation]

---

**最后更新**: 2026-02-02 12:00:00
**维护者**: Device Passport Team
