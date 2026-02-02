# 🚀 设备护照系统 - 快速启动

## 📦 首次使用（只需执行一次）

### 步骤 1: 安装依赖

```bash
# 安装Node.js依赖
pnpm install
```

### 步骤 2: 配置防火墙

**以管理员身份运行**（右键点击 → 以管理员身份运行）：
```
setup-firewall.bat
```

这将允许局域网内其他设备访问系统。

### 步骤 3: 启动数据库

```
start-server.bat
```

等待看到 "Ready to accept connections!" 消息

### 步骤 4: 运行数据库迁移（新窗口）

```bash
cd apps\api
npm run migration:run
npm run seed  # 可选：加载测试数据
```

## 🎯 日常使用（最简单）

### 方式一：一键启动（推荐）✨

双击运行：
```
start-all.bat
```

这将自动：
- ✅ 启动数据库和Redis
- ✅ 启动API服务器（当前窗口）
- ✅ 启动Web服务器（新窗口）

### 方式二：分别启动

**终端 1** - 启动API服务器：
```
start-server.bat
```

**终端 2** - 启动Web服务器：
```
start-web.bat
```

## 🌐 访问地址

### 从本机访问
- **Web界面**: http://localhost:5173
- **API服务**: http://localhost:3000/api/v1
- **Swagger文档**: http://localhost:3000/api/docs

### 从局域网内其他设备访问
- **Web界面**: http://192.168.71.21:5173
- **API服务**: http://192.168.71.21:3000/api/v1
- **Swagger文档**: http://192.168.71.21:3000/api/docs
- **数据库管理**: http://192.168.71.21:8080

## 📱 手机/平板测试

1. 确保手机与服务器在**同一WiFi网络**
2. 打开手机浏览器
3. 访问: `http://192.168.71.21:5173`

### 生成二维码（可选）

```bash
npm install -g qrcode-terminal
qrcode-terminal http://192.168.71.21:5173
```

扫描二维码即可访问！

## 🔍 检查服务状态

双击运行：
```
check-services.bat
```

将显示所有服务的运行状态。

## 🛑 停止所有服务

双击运行：
```
stop-all.bat
```

或在运行的窗口按 `Ctrl+C`

## 👤 测试账号

### 管理员
- 邮箱: `admin@example.com`
- 密码: `Admin123!`

### 普通用户
- 邮箱: `user@example.com`
- 密码: `User123!`

### 专家
- 邮箱: `expert@example.com`
- 密码: `Expert123!`

## ⚠️ 常见问题

### 问题1: 其他设备无法访问

**解决方案**:
1. 以管理员身份运行 `setup-firewall.bat`
2. 检查两个设备是否在同一WiFi网络
3. 确认服务器IP是否为 `192.168.71.21`（运行`ipconfig`检查）

### 问题2: 端口已被占用

**检查端口占用**:
```bash
netstat -ano | findstr :3000  # API端口
netstat -ano | findstr :5173  # Web端口
```

**解决方案**:
- 关闭占用端口的程序
- 或修改 `.env` 文件中的端口号

### 问题3: Docker启动失败

**解决方案**:
1. 确保Docker Desktop已安装并运行
2. 重启Docker Desktop
3. 运行 `docker ps` 检查状态

### 问题4: 数据库连接失败

**解决方案**:
```bash
cd docker
docker-compose restart postgres
docker-compose logs postgres  # 查看日志
```

## 📂 项目文件说明

| 文件 | 用途 |
|------|------|
| `start-all.bat` | 🌟 一键启动所有服务（推荐） |
| `start-server.bat` | 启动API服务器 |
| `start-web.bat` | 启动Web前端 |
| `stop-all.bat` | 停止所有服务 |
| `check-services.bat` | 检查服务状态 |
| `setup-firewall.bat` | 配置防火墙规则（需管理员权限） |
| `START-GUIDE.md` | 详细启动指南 |
| `.env` | 环境配置文件 |
| `apps/web/.env` | 前端配置文件 |

## 🔐 安全提示

⚠️ **重要**:
- 此配置仅用于**局域网测试**
- **不要**将服务暴露到公网
- 生产环境需修改默认密码和JWT密钥

## 📖 更多帮助

详细文档请查看:
- [START-GUIDE.md](./START-GUIDE.md) - 完整启动指南
- [CLAUDE.md](./CLAUDE.md) - 项目开发文档

## 🆘 需要帮助？

1. 运行 `check-services.bat` 检查服务状态
2. 查看终端窗口的错误信息
3. 检查 `START-GUIDE.md` 中的故障排查部分

---

**祝使用愉快！** 🎉
