# E2E测试指南
## End-to-End Testing Guide

**最后更新**: 2026-02-03
**测试框架**: Playwright
**覆盖范围**: 跨浏览器 + 移动端

---

## 快速开始

### 方法一：使用测试脚本（推荐）

```bash
# 1. 先启动所有服务（新窗口）
start-all.bat

# 2. 等待服务完全启动（约30秒）
# 确认可以访问：
# - http://localhost:5173 （前端）
# - http://localhost:3000/api/docs （后端）

# 3. 运行E2E测试脚本（新窗口）
run-e2e-tests.bat
```

### 方法二：手动步骤

#### 第一步：启动所有服务

```bash
# 窗口1：启动全部服务
start-all.bat
```

**等待服务完全启动**，确认以下URL可访问：
- ✅ http://localhost:5173 - 前端加载成功
- ✅ http://localhost:3000/api/docs - Swagger文档显示
- ✅ http://localhost:8080 - Adminer数据库管理

#### 第二步：准备测试数据

```bash
# 窗口2：准备数据库
cd apps/api

# 重置数据库（可选，清空旧数据）
npm run db:reset

# 运行迁移
npm run migration:run

# 填充测试数据（必需）
npm run seed

cd ../..
```

#### 第三步：安装Playwright浏览器（首次运行）

```bash
# 安装测试浏览器
npx playwright install
```

#### 第四步：运行E2E测试

```bash
# 运行所有E2E测试
pnpm test:e2e

# 或者分浏览器运行
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# 或者只运行移动端测试
pnpm test:e2e:mobile
```

---

## 测试套件说明

### 1. 认证测试 (auth.spec.ts)

测试内容：
- ✅ 无效凭证显示验证错误
- ✅ 有效凭证成功登录
- ✅ 成功登出
- ✅ 未登录时阻止访问受保护路由
- ✅ 刷新页面后会话持久化

**覆盖浏览器**：
- Chromium
- Firefox
- WebKit
- Mobile Chrome
- Mobile Safari

### 2. 设备护照测试 (device-passport.spec.ts)

测试内容：
- ✅ 显示护照列表
- ✅ 搜索护照功能
- ✅ 查看护照详情
- ✅ 使用公开接口扫描护照
- ✅ 按状态筛选护照
- ✅ 导出护照数据

**覆盖浏览器**：全部（5个）

### 3. 移动响应式测试 (mobile-responsive.spec.ts)

测试内容：
- ✅ 移动端友好导航
- ✅ 移动设备上登录
- ✅ 移动设备上扫描QR码
- ✅ 移动视图下显示护照列表
- ✅ 处理触摸手势
- ✅ 平板电脑自适应布局
- ✅ 平板上显示护照网格
- ✅ PWA离线功能（基础）

**覆盖浏览器**：
- Chromium (桌面模拟)
- Firefox (桌面模拟)
- WebKit (桌面模拟)
- Mobile Chrome (真实移动视口)
- Mobile Safari (真实移动视口)

---

## 测试配置

### Playwright配置文件

`playwright.config.ts`:

```typescript
{
  // 基础URL
  use: {
    baseURL: 'http://localhost:5173',
  },

  // Web服务器配置（可选）
  webServer: {
    command: 'pnpm dev:web',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },

  // 项目配置
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
}
```

---

## 常见错误及解决方案

### 错误1: 连接被拒绝 (ECONNREFUSED)

```
Error: connect ECONNREFUSED 127.0.0.1:5173
```

**原因**：前端服务器未运行

**解决方案**：
```bash
# 启动前端
pnpm dev:web

# 或使用启动脚本
start-all.bat
```

### 错误2: API 404错误

```
Error: Request failed with status code 404
```

**原因**：后端API未运行或URL错误

**解决方案**：
```bash
# 检查后端是否运行
curl http://localhost:3000/api/v1/scan/test

# 如果失败，启动后端
pnpm dev:api

# 或使用启动脚本
start-all.bat
```

### 错误3: 测试超时

```
Error: Test timeout of 30000ms exceeded
```

**原因**：
- 服务启动太慢
- 网络延迟
- 页面加载慢

**解决方案**：
```typescript
// 增加超时时间（在测试文件中）
test.setTimeout(60000); // 60秒

// 或在playwright.config.ts中全局设置
{
  timeout: 60000,
}
```

### 错误4: 元素未找到

```
Error: Locator.click: Target closed
```

**原因**：
- 页面导航过快
- 元素未加载完成
- CSS选择器错误

**解决方案**：
```typescript
// 等待元素可见
await page.waitForSelector('button[type="submit"]', { state: 'visible' });

// 或使用更可靠的定位器
await page.getByRole('button', { name: 'Submit' }).click();
```

### 错误5: 数据库无数据

```
Error: No users found for login
```

**原因**：测试数据未填充

**解决方案**：
```bash
cd apps/api
npm run seed
cd ../..
```

### 错误6: 76个测试全部失败

**原因**：服务未启动

**解决方案**：
1. 先启动所有服务：
   ```bash
   start-all.bat
   ```

2. 等待30秒让服务完全启动

3. 验证服务运行：
   ```bash
   # 测试后端
   curl http://localhost:3000/api/docs

   # 测试前端（浏览器打开）
   http://localhost:5173
   ```

4. 确认数据已填充：
   ```bash
   cd apps/api
   npm run seed
   cd ../..
   ```

5. 重新运行测试：
   ```bash
   pnpm test:e2e
   ```

---

## 调试测试

### 1. UI模式（推荐）

```bash
# 以UI模式运行（可视化调试）
pnpm test:e2e:ui
```

特点：
- 实时查看浏览器执行
- 逐步调试
- 查看DOM快照
- 时间旅行调试

### 2. 有界面模式

```bash
# 显示浏览器窗口
pnpm test:e2e:headed
```

### 3. 调试模式

```bash
# 暂停并等待调试器
pnpm test:e2e:debug
```

### 4. 查看报告

```bash
# 生成HTML报告
pnpm test:e2e:report
```

### 5. 单个测试文件

```bash
# 只运行认证测试
npx playwright test e2e/auth.spec.ts

# 只运行设备护照测试
npx playwright test e2e/device-passport.spec.ts
```

### 6. 指定浏览器

```bash
# 只在Chrome运行
npx playwright test --project=chromium

# 只在移动端运行
npx playwright test --project="Mobile Chrome"
```

---

## 测试数据要求

E2E测试依赖以下测试数据（由`pnpm db:seed`创建）：

### 测试用户

```
Admin:
  email: admin@luna.top
  password: password123

Operator:
  email: operator@luna.top
  password: password123

Expert:
  email: expert@luna.top
  password: password123

Customer:
  email: customer@luna.top
  password: password123
```

### 测试设备护照

至少需要以下数据：
- 3+ 设备护照记录
- 不同的状态（CREATED, IN_SERVICE等）
- 有效的QR码

### 验证测试数据

```bash
# 使用Adminer查看数据
# 访问：http://localhost:8080

# 或使用psql
docker exec -it device-passport-db psql -U postgres -d device_passport

# 查看用户数量
SELECT COUNT(*) FROM users;

# 查看护照数量
SELECT COUNT(*) FROM device_passports;
```

---

## 测试最佳实践

### 1. 测试前准备

```bash
# 每次测试前确保：
✅ Docker容器运行
✅ 数据库迁移完成
✅ 测试数据已填充
✅ 前端服务运行在5173
✅ 后端服务运行在3000
```

### 2. 测试隔离

每个测试应该：
- 独立运行（不依赖其他测试）
- 清理自己的数据
- 不影响其他测试

### 3. 稳定的选择器

优先使用：
```typescript
// ✅ 推荐：语义化选择器
page.getByRole('button', { name: 'Login' })
page.getByLabel('Email')
page.getByText('Welcome')

// ❌ 避免：脆弱的CSS选择器
page.locator('.btn-primary')
page.locator('div > button:nth-child(3)')
```

### 4. 等待策略

```typescript
// ✅ 推荐：明确等待
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="passport-list"]');

// ❌ 避免：硬编码延迟
await page.waitForTimeout(5000);
```

---

## CI/CD集成

### GitHub Actions示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres123
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate

      - name: Seed database
        run: pnpm db:seed

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 性能优化

### 1. 并行执行

```typescript
// playwright.config.ts
{
  workers: process.env.CI ? 1 : 4, // 本地4个并行，CI单线程
}
```

### 2. 重用浏览器上下文

```typescript
test.describe.configure({ mode: 'parallel' });
```

### 3. 跳过不必要的测试

```bash
# 只运行关键测试
pnpm test:e2e --grep "@critical"
```

---

## 测试覆盖范围

### 当前覆盖

- ✅ 认证流程（登录/登出）
- ✅ 设备护照CRUD
- ✅ QR码扫描
- ✅ 移动响应式
- ✅ 跨浏览器兼容性

### 待增加

- ⏳ 专家服务流程
- ⏳ 市场交易流程
- ⏳ 积分系统
- ⏳ 文件上传
- ⏳ WebSocket实时通知

---

## 总结

E2E测试是确保系统质量的关键环节。遇到问题时：

1. ✅ 确认所有服务运行（start-all.bat）
2. ✅ 验证测试数据存在（pnpm db:seed）
3. ✅ 使用UI模式调试（pnpm test:e2e:ui）
4. ✅ 查看详细报告（pnpm test:e2e:report）

**记住**：所有服务必须先启动，E2E测试才能运行！

---

**文档维护者**: Development Team
**最后测试**: 2026-02-03
**测试状态**: ✅ 通过（服务运行时）

