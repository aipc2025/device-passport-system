# 快速启动指南

本指南将帮助你在 5 分钟内启动设备护照系统。

## 前置要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL 16
- Redis 7 (可选)
- Docker & Docker Compose (推荐)

## 方法 1: Docker 快速启动（推荐）

### 1. 克隆并安装依赖

```bash
git clone <repository-url>
cd device-passport-system
pnpm install
```

### 2. 启动数据库服务

```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d db redis
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（如果需要）
# 默认配置已经可以工作
```

### 4. 初始化数据库

```bash
# 运行种子数据脚本
pnpm db:seed
```

### 5. 启动开发服务器

```bash
# 启动所有服务（API + Web）
pnpm dev

# 或者分别启动
pnpm dev:api   # 后端: http://localhost:3000
pnpm dev:web   # 前端: http://localhost:5173
```

### 6. 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **Swagger 文档**: http://localhost:3000/api/docs

### 7. 使用测试账号登录

```
管理员: admin@luna.top / password123
操作员: operator@luna.top / password123
工程师: engineer@luna.top / password123
质检员: qc@luna.top / password123
客户: customer@luna.top / password123
专家: expert@luna.top / password123
```

---

## 方法 2: 本地开发环境

### 1. 安装 PostgreSQL

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16

# Windows
# 下载安装程序: https://www.postgresql.org/download/windows/
```

### 2. 创建数据库

```bash
# 连接到 PostgreSQL
psql postgres

# 创建数据库和用户
CREATE DATABASE device_passport;
CREATE USER passport_user WITH PASSWORD 'passport_password';
GRANT ALL PRIVILEGES ON DATABASE device_passport TO passport_user;
\q
```

### 3. 安装依赖并配置

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

### 4. 初始化和启动

```bash
# 运行种子数据
pnpm db:seed

# 启动开发服务器
pnpm dev
```

---

## 环境变量配置

### 后端 (apps/api/.env)

```env
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=passport_user
DATABASE_PASSWORD=passport_password
DATABASE_NAME=device_passport

# Redis 配置 (可选)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 公司代码
COMPANY_CODE=MED

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 前端 (apps/web/.env)

```env
VITE_API_URL=http://localhost:3000
```

---

## 常见问题

### Q1: pnpm 命令找不到

```bash
# 安装 pnpm
npm install -g pnpm@9.0.0
```

### Q2: 数据库连接失败

检查：
1. PostgreSQL 服务是否运行
2. .env 文件中的数据库凭据是否正确
3. 数据库是否已创建

```bash
# 检查 PostgreSQL 状态
# macOS
brew services list | grep postgresql

# Ubuntu/Debian
sudo systemctl status postgresql

# 手动连接测试
psql -h localhost -U passport_user -d device_passport
```

### Q3: 端口已被占用

修改端口：
```bash
# 后端 (apps/api/.env)
PORT=3001

# 前端 (apps/web/vite.config.ts)
# 修改 server.port 配置
```

### Q4: 种子数据运行失败

```bash
# 确保数据库为空或重置数据库
pnpm db:reset

# 重新运行种子数据
pnpm db:seed
```

---

## 开发工作流

### 1. 创建新的护照

```bash
# 使用 API
curl -X POST http://localhost:3000/api/v1/passports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Test Device",
    "deviceModel": "Model-123",
    "manufacturer": "Test Manufacturer",
    "productLine": "PF",
    "originCode": "CN"
  }'

# 或使用前端界面
# 登录 -> 护照管理 -> 创建护照
```

### 2. 扫描护照

访问: http://localhost:5173/scan

输入护照码（例如）: `DP-MED-2601-PF-CN-000001-0A`

### 3. 查看 Swagger 文档

访问: http://localhost:3000/api/docs

---

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行后端测试
pnpm test:api

# 运行前端测试
pnpm test:web

# 运行 E2E 测试
pnpm test:e2e

# 生成覆盖率报告
pnpm test:cov
```

---

## 构建生产版本

```bash
# 构建所有项目
pnpm build

# 构建后端
pnpm build:api

# 构建前端
pnpm build:web
```

---

## 数据库管理

### 生成迁移

```bash
# 生成迁移文件
pnpm db:migrate:generate -- -n MigrationName

# 运行迁移
pnpm db:migrate

# 回滚迁移
pnpm db:migrate:revert
```

### 重置数据库

```bash
# 警告：这会删除所有数据！
pnpm db:reset
pnpm db:seed
```

---

## 代码质量

### Linting

```bash
# 运行 ESLint
pnpm lint

# 自动修复问题
pnpm lint --fix
```

### 格式化

```bash
# 格式化所有代码
pnpm format

# 检查类型
pnpm typecheck
```

---

## 调试

### 后端调试

1. 在 VS Code 中添加断点
2. 按 F5 或使用调试面板启动
3. 或使用命令：

```bash
pnpm --filter @device-passport/api run start:debug
```

### 前端调试

使用浏览器的开发者工具：
- Chrome DevTools: F12
- React DevTools 扩展
- Redux DevTools 扩展（如果使用 Redux）

---

## 生产部署建议

### 1. 环境变量

- 使用强密码和密钥
- 设置 `NODE_ENV=production`
- 配置 CORS 白名单
- 设置合适的 `JWT_EXPIRES_IN`

### 2. 数据库

- 禁用 `synchronize: true`
- 使用迁移管理架构变更
- 设置连接池
- 定期备份

### 3. 性能

- 启用 Redis 缓存
- 配置 CDN（静态资源）
- 启用 Gzip 压缩
- 使用负载均衡

### 4. 安全

- 启用 HTTPS
- 配置 rate limiting
- 添加 CSRF protection
- 实施 SQL injection 防护
- 定期安全审计

---

## 获取帮助

- **文档**: 查看 `CLAUDE.md` 和 `VERIFICATION_REPORT.md`
- **Issues**: 提交问题到 GitHub Issues
- **测试账号**: 见上方"使用测试账号登录"部分

---

## 下一步

1. 探索 Swagger API 文档
2. 查看前端界面
3. 创建测试数据
4. 阅读项目文档
5. 开始开发新功能

祝你使用愉快！🚀
