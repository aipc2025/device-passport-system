# Claude Code 使用指南 - 设备数字护照系统开发

## 一、Claude Code (Windows 客户端) 安装与配置

### 1.1 安装 Claude Code

```bash
# 方式1: 通过 npm 全局安装
npm install -g @anthropic-ai/claude-code

# 方式2: 通过下载安装包
# 访问 https://claude.ai/code 下载 Windows 安装程序
```

### 1.2 初始化项目

```bash
# 进入项目目录
cd your-project-folder

# 初始化 Claude Code
claude init

# 或者直接启动
claude
```

### 1.3 配置 API Key

```bash
# 设置环境变量 (PowerShell)
$env:ANTHROPIC_API_KEY = "your-api-key"

# 或在 Windows 系统环境变量中永久设置
# 系统属性 → 高级 → 环境变量 → 新建
```

---

## 二、项目技能文件配置

### 2.1 技能文件目录结构

在项目根目录创建 `.claude/skills/` 文件夹：

```
your-project/
├── .claude/
│   └── skills/
│       ├── SKILL.md           # 主技能文件 (必需)
│       ├── BACKEND.md         # 后端开发指南
│       ├── FRONTEND.md        # 前端开发指南
│       ├── DATABASE.md        # 数据库设计指南
│       └── DEPLOYMENT.md      # 部署指南
├── apps/
├── packages/
└── package.json
```

### 2.2 主技能文件示例 (SKILL.md)

```markdown
# Project Skill File

## Project Overview
- Name: Device Passport System
- Type: Full-stack B2B application
- Stack: React + NestJS + PostgreSQL

## Key Commands
- `pnpm dev` - Start development
- `pnpm build` - Build for production
- `pnpm test` - Run tests

## Architecture
[描述项目架构]

## Coding Standards
[描述编码规范]

## Common Tasks
[描述常见任务]
```

---

## 三、高效使用 Claude Code 的方法

### 3.1 任务分解策略

**原则：将大任务分解为小的、可验证的步骤**

```
❌ 不好的方式:
"帮我实现整个设备管理系统"

✅ 好的方式:
1. "创建设备护照的数据库表结构"
2. "实现护照码生成服务，包含校验位"
3. "创建护照 CRUD 的 REST API"
4. "添加护照列表页面"
```

### 3.2 常用命令模式

#### 创建新模块
```
创建一个新的 NestJS 模块用于管理质检记录，包含：
- Entity 定义
- DTO (Create/Update)
- Service
- Controller
- 基础单元测试

参考 BACKEND.md 中的模板
```

#### 修复 Bug
```
在 passport.service.ts 中有一个问题：
当序列号超过 999999 时会出错。

请修复这个问题，要求：
1. 添加序列号溢出检查
2. 抛出有意义的错误信息
3. 添加单元测试
```

#### 代码重构
```
将 DeviceDetail 页面中的状态更新逻辑提取到自定义 Hook:
- 创建 useDeviceStatus hook
- 保持现有功能不变
- 添加 loading 和 error 状态
```

#### 添加功能
```
为设备详情页添加二维码显示功能：
1. 使用 qrcode.react 库
2. 二维码内容为设备护照码
3. 支持下载二维码图片
4. 在移动端自适应大小
```

### 3.3 上下文管理技巧

```bash
# 方式1: 指定要读取的文件
claude "参考 src/modules/passport/passport.service.ts 的实现，
创建类似的 service-order.service.ts"

# 方式2: 使用 @ 引用文件
claude "修改 @src/pages/DeviceDetail.tsx 添加编辑功能"

# 方式3: 使用 /add 命令添加上下文
/add src/modules/passport/*.ts
然后询问问题
```

### 3.4 验证与测试

```bash
# 让 Claude 在完成代码后验证
claude "创建 xxx 功能，完成后：
1. 运行 pnpm lint 检查代码风格
2. 运行 pnpm test 确保测试通过
3. 如果有错误，自动修复"
```

---

## 四、开发工作流程

### 4.1 MVP 开发流程

```
Phase 1: 数据库 (Week 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
命令序列:

1. "根据 SKILL.md 中的数据模型，创建 TypeORM entities"
2. "生成数据库迁移文件"
3. "创建种子数据脚本"
4. "验证数据库结构是否正确"

Phase 2: 后端 API (Week 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
命令序列:

1. "创建护照码生成服务 PassportCodeService"
2. "创建 Passport 模块的 CRUD API"
3. "添加 JWT 认证和角色守卫"
4. "创建公开的扫码查询 API"
5. "添加 Swagger 文档"
6. "编写 API 集成测试"

Phase 3: 前端 (Week 3-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
命令序列:

1. "配置 React 项目，安装依赖"
2. "创建 API 服务层"
3. "实现首页和扫码查询页"
4. "实现设备详情页"
5. "实现登录和权限控制"
6. "实现管理后台页面"
```

### 4.2 每日开发流程

```
早上开始:
┌─────────────────────────────────────────────┐
│ 1. 检查昨天的代码状态                        │
│    claude "检查 git status，总结待完成工作"   │
├─────────────────────────────────────────────┤
│ 2. 规划今日任务                              │
│    claude "根据 TODO.md，规划今天的任务"      │
└─────────────────────────────────────────────┘

开发过程:
┌─────────────────────────────────────────────┐
│ 3. 实现功能 (每次一个小功能)                  │
│    claude "实现 xxx 功能"                    │
├─────────────────────────────────────────────┤
│ 4. 验证功能                                  │
│    claude "运行测试，验证 xxx 功能"           │
├─────────────────────────────────────────────┤
│ 5. 提交代码                                  │
│    claude "提交代码，生成有意义的 commit msg" │
└─────────────────────────────────────────────┘

结束工作:
┌─────────────────────────────────────────────┐
│ 6. 总结今日工作                              │
│    claude "总结今日完成的工作，更新 TODO.md"  │
└─────────────────────────────────────────────┘
```

---

## 五、具体任务命令参考

### 5.1 数据库任务

```bash
# 创建新实体
claude "创建 QualityInspection 实体，字段参考 SKILL.md 中的质检阶段定义"

# 添加关联
claude "在 DevicePassport 和 QualityInspection 之间添加一对多关系"

# 创建迁移
claude "为 quality_inspections 表创建 TypeORM 迁移"

# 添加索引
claude "为 quality_inspections 表添加 device_id 和 inspection_date 索引"
```

### 5.2 后端 API 任务

```bash
# 创建完整模块
claude "创建 QualityInspection 模块，包含完整的 CRUD 和 DTO"

# 添加业务逻辑
claude "在 PassportService 中添加状态转换验证逻辑"

# 添加权限控制
claude "为 QC_INSPECTOR 角色添加质检状态更新权限"

# 错误处理
claude "添加全局异常过滤器，统一 API 错误响应格式"

# API 文档
claude "为 PassportController 添加完整的 Swagger 装饰器"
```

### 5.3 前端任务

```bash
# 创建页面
claude "创建设备列表页面，支持分页、筛选和搜索"

# 创建组件
claude "创建可复用的 DataTable 组件，支持排序和筛选"

# 状态管理
claude "创建设备状态的 Zustand store"

# API 集成
claude "使用 React Query 封装设备 API 调用 hooks"

# 表单处理
claude "使用 react-hook-form 创建设备创建表单"
```

### 5.4 测试任务

```bash
# 单元测试
claude "为 PassportCodeService 编写单元测试，覆盖所有边界情况"

# 集成测试
claude "为 Passport API 编写集成测试"

# E2E 测试
claude "使用 Playwright 编写设备创建流程的 E2E 测试"
```

---

## 六、常见问题解决

### 6.1 代码生成不完整

```bash
# 问题: 生成的代码不完整或被截断
# 解决: 分步请求

# 而不是:
claude "创建完整的用户管理模块"

# 改为:
claude "创建 User 实体定义"
claude "创建 User DTOs"
claude "创建 UserService"
claude "创建 UserController"
```

### 6.2 上下文丢失

```bash
# 问题: Claude 似乎忘记了之前的内容
# 解决: 明确引用文件

claude "参考 @src/modules/passport/passport.service.ts 的模式，
创建 @src/modules/inspection/inspection.service.ts"
```

### 6.3 代码风格不一致

```bash
# 问题: 生成的代码风格不统一
# 解决: 在技能文件中明确规范

# SKILL.md 中添加:
## Code Style
- 使用 2 空格缩进
- 使用单引号
- 每行最多 100 字符
- 使用 ESLint + Prettier
```

### 6.4 测试失败

```bash
# 问题: 生成的测试无法运行
# 解决: 提供更多上下文

claude "运行 pnpm test，如果失败，分析错误原因并修复"
```

---

## 七、提高效率的技巧

### 7.1 使用模板

在 `.claude/templates/` 中存放常用模板：

```
.claude/
└── templates/
    ├── nestjs-module.md
    ├── react-page.md
    ├── api-test.md
    └── component.md
```

使用时引用：
```bash
claude "参考 @.claude/templates/nestjs-module.md 创建 Logistics 模块"
```

### 7.2 创建别名命令

在项目 package.json 中添加脚本：

```json
{
  "scripts": {
    "c:module": "claude '创建新的 NestJS 模块'",
    "c:page": "claude '创建新的 React 页面'",
    "c:test": "claude '为最近修改的文件添加测试'"
  }
}
```

### 7.3 使用会话延续

```bash
# 开始新会话
claude

# 在会话中可以连续对话
> 创建 User 实体
> 现在添加角色枚举
> 添加与组织的关联
> 生成迁移文件
```

---

## 八、项目特定命令速查

### 设备护照系统常用命令

```bash
# 护照管理
claude "为护照添加批量导入功能"
claude "添加护照状态变更历史记录"
claude "实现护照码防伪验证"

# 质检流程
claude "创建质检检查项模板管理"
claude "添加质检报告 PDF 生成功能"
claude "实现质检不合格的处理流程"

# 物流追踪
claude "集成第三方物流 API 查询"
claude "实现物流轨迹地图展示"

# 工单系统
claude "实现工单自动派单算法"
claude "添加工程师位置追踪"
claude "创建服务记录上传功能"

# 报表统计
claude "创建设备状态统计仪表盘"
claude "生成月度服务报告"
```

---

*技能文件更新日期: 2025年1月*
