# 立即启动指南 | Quick Start Guide

## 🚨 当前问题：API服务器未运行

您看到 "Invalid credentials" 错误是因为 **API服务器（端口3000）没有启动**。

---

## ✅ 解决方案（3步）

### 第1步：启动API服务器 ⭐ 必须

1. 打开**新的命令提示符窗口**（普通权限即可）
2. 运行以下命令：

```cmd
cd D:\device-passport-system\apps\api
npm run start:dev
```

3. **等待启动完成**，看到以下信息表示成功：

```
[Nest] XXXXX  - LOG [NestApplication] Nest application successfully started
[Nest] XXXXX  - LOG Application is running on: http://0.0.0.0:3000
[Nest] XXXXX  - LOG Swagger documentation available at: http://0.0.0.0:3000/api/docs
```

**⚠️ 保持此窗口打开，不要关闭！**

---

### 第2步：启动前端服务器 ⭐ 必须

1. 打开**另一个新的命令提示符窗口**
2. 运行以下命令：

```cmd
cd D:\device-passport-system\apps\web
npm run dev -- --host 0.0.0.0
```

3. **等待启动完成**，看到以下信息表示成功：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.71.21:5173/
```

**⚠️ 保持此窗口打开，不要关闭！**

---

### 第3步：测试登录

#### 方法A：使用浏览器（推荐）

1. 打开浏览器访问：http://192.168.71.21:5173
2. 输入以下账号：
   - **邮箱**: `admin@luna.top`
   - **密码**: `DevTest2026!@#$`
3. 点击登录

#### 方法B：使用测试脚本

双击运行项目根目录下的：`test-login.bat`

这个脚本会：
1. 测试API是否可访问
2. 自动发送登录请求
3. 显示返回结果

---

## 🔍 验证服务状态

### 检查API服务器

在浏览器访问：http://192.168.71.21:3000/api/v1/health

**应该看到**：
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T..."
}
```

### 检查前端服务器

在浏览器访问：http://192.168.71.21:5173

**应该看到**：登录页面

### 检查数据库

```cmd
docker ps
```

**应该看到这3个容器在运行**：
- `device-passport-db` (PostgreSQL)
- `device-passport-redis` (Redis)
- `device-passport-adminer` (Adminer)

---

## 📋 测试账号列表

所有账号的密码都是：`DevTest2026!@#$`

| 角色 | 邮箱 | 说明 |
|------|------|------|
| 管理员 | admin@luna.top | 完全权限 |
| 操作员 | operator@luna.top | 设备管理 |
| 工程师 | engineer@luna.top | 服务执行 |
| 质检员 | qc@luna.top | 质量检查 |
| 客户 | customer@luna.top | 普通客户 |
| 专家 | expert@luna.top | 专家用户 |

---

## ❌ 常见问题

### 问题1：端口被占用

**症状**：启动时报错 "Port 3000 is already in use"

**解决**：
```cmd
# 查看占用进程
netstat -ano | findstr :3000

# 结束进程（替换XXXXX为进程ID）
taskkill /PID XXXXX /F

# 重新启动
cd apps\api
npm run start:dev
```

### 问题2：Docker服务未启动

**症状**：启动时报错 "Error: connect ECONNREFUSED 127.0.0.1:5432"

**解决**：
1. 打开 Docker Desktop
2. 等待Docker启动完成
3. 运行：`docker ps` 确认容器运行
4. 重新启动API服务器

### 问题3：数据库未初始化

**症状**：登录时报错 "User not found"

**解决**：
```cmd
cd apps\api
npm run seed
```

看到 "Seed completed successfully!" 后重试登录。

### 问题4：环境变量问题

**症状**：各种奇怪的错误

**解决**：
1. 确保 `D:\device-passport-system\.env` 文件存在
2. 确保 `D:\device-passport-system\apps\web\.env` 文件存在
3. 内容应该包含正确的IP地址：192.168.71.21

---

## 🎯 快速诊断

如果遇到问题，按顺序检查：

1. **Docker运行？** → `docker ps` 应该看到3个容器
2. **API启动？** → 访问 http://localhost:3000/api/v1/health
3. **前端启动？** → 访问 http://localhost:5173
4. **数据库有数据？** → 运行 `npm run seed`
5. **密码正确？** → `DevTest2026!@#$`（注意大小写和符号）

---

## 💡 提示

1. **两个终端窗口都必须保持打开**
2. **先启动API，再启动前端**
3. **等待启动完成再访问页面**
4. **使用完整密码，包括所有符号**

---

## 📞 仍然有问题？

如果按照以上步骤操作后仍无法登录，请提供以下信息：

1. API服务器终端的完整输出
2. 前端服务器终端的完整输出
3. 浏览器控制台（F12）的错误信息
4. 运行 `test-login.bat` 的输出结果

---

**最后更新**: 2026-02-02
**当前版本**: 1.0.0
