# 设备护照系统 - 局域网启动指南

## 📋 系统信息

- **服务器IP**: 192.168.71.21
- **API端口**: 3000
- **Web端口**: 5173
- **数据库端口**: 5432
- **Redis端口**: 6379
- **Adminer端口**: 8080

## 🚀 快速启动步骤

### 1️⃣ 启动数据库和Redis

```bash
# 进入docker目录
cd docker

# 启动PostgreSQL和Redis
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志（可选）
docker-compose logs -f
```

**预期输出**:
- ✅ device-passport-db (PostgreSQL) - healthy
- ✅ device-passport-redis (Redis) - healthy
- ✅ device-passport-adminer (数据库管理) - running

### 2️⃣ 安装依赖（首次运行）

```bash
# 回到项目根目录
cd ..

# 安装依赖
pnpm install
```

### 3️⃣ 运行数据库迁移（首次运行）

```bash
# 运行数据库迁移
cd apps/api
npm run migration:run

# 可选：运行种子数据
npm run seed
```

### 4️⃣ 启动后端API

```bash
# 在项目根目录
pnpm dev:api

# 或者在apps/api目录
cd apps/api
npm run start:dev
```

**启动成功标志**:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Device Passport System - API Server                    ║
║   Environment: development                                ║
║   Port: 3000                                              ║
║   URL: http://0.0.0.0:3000/api/v1                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Ready to accept connections! 🚀
```

**API访问地址**:
- 本机: http://localhost:3000/api/v1
- 局域网: http://192.168.71.21:3000/api/v1
- Swagger文档: http://192.168.71.21:3000/api/docs

### 5️⃣ 启动前端Web（新开终端）

```bash
# 在项目根目录（新终端窗口）
pnpm dev:web

# 或者在apps/web目录
cd apps/web
npm run dev
```

**启动成功标志**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.71.21:5173/
  ➜  press h + enter to show help
```

## 🌐 访问地址

### 本机访问
- **前端**: http://localhost:5173
- **API**: http://localhost:3000/api/v1
- **Swagger文档**: http://localhost:3000/api/docs
- **数据库管理**: http://localhost:8080

### 局域网内其他设备访问
- **前端**: http://192.168.71.21:5173
- **API**: http://192.168.71.21:3000/api/v1
- **Swagger文档**: http://192.168.71.21:3000/api/docs
- **数据库管理**: http://192.168.71.21:8080

## 📱 移动设备测试

### Android/iOS 手机/平板
1. 确保设备连接到同一局域网（同一WiFi）
2. 打开浏览器（推荐Chrome/Safari）
3. 访问: `http://192.168.71.21:5173`

### 扫码访问（可选）
使用以下命令生成二维码：
```bash
# 安装qrcode-terminal
npm install -g qrcode-terminal

# 生成二维码
qrcode-terminal http://192.168.71.21:5173
```

## 🔧 故障排查

### 问题1: 其他设备无法访问

**检查Windows防火墙**:
```powershell
# 以管理员身份运行PowerShell

# 允许3000端口（API）
netsh advfirewall firewall add rule name="Device Passport API" dir=in action=allow protocol=TCP localport=3000

# 允许5173端口（Web）
netsh advfirewall firewall add rule name="Device Passport Web" dir=in action=allow protocol=TCP localport=5173

# 允许8080端口（Adminer）
netsh advfirewall firewall add rule name="Device Passport Adminer" dir=in action=allow protocol=TCP localport=8080
```

### 问题2: 数据库连接失败

```bash
# 检查Docker服务状态
docker ps

# 重启数据库
cd docker
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres
```

### 问题3: API启动失败

```bash
# 检查3000端口是否被占用
netstat -ano | findstr :3000

# 如果被占用，修改端口（在.env中）
PORT=3001
```

### 问题4: 前端显示连接失败

检查 `apps/web/.env` 文件中的API地址是否正确：
```env
VITE_API_URL=http://192.168.71.21:3000
```

## 🧪 测试账号

### 管理员账号
- **用户名**: admin@example.com
- **密码**: Admin123!

### 普通用户账号
- **用户名**: user@example.com
- **密码**: User123!

### 专家账号
- **用户名**: expert@example.com
- **密码**: Expert123!

## 📊 数据库管理

访问 Adminer: http://192.168.71.21:8080

**登录信息**:
- 系统: PostgreSQL
- 服务器: postgres (或 192.168.71.21)
- 用户名: passport_user
- 密码: passport_password
- 数据库: device_passport

## 🛑 停止服务

```bash
# 停止API（Ctrl+C）
# 停止Web（Ctrl+C）

# 停止数据库和Redis
cd docker
docker-compose down

# 停止并删除数据（谨慎使用）
docker-compose down -v
```

## 📝 开发调试

### 查看API日志
```bash
cd apps/api
npm run start:dev
```

### 查看前端日志
```bash
cd apps/web
npm run dev
```

### 运行测试
```bash
# API测试
cd apps/api
npm test

# E2E测试
cd apps/web
npm run test:e2e
```

## 🔐 安全注意事项

1. ⚠️ **仅限局域网内测试使用**
2. ⚠️ **不要暴露到公网**
3. ⚠️ **生产环境需要更改JWT密钥**
4. ⚠️ **生产环境需要更改数据库密码**
5. ⚠️ **启用HTTPS（生产环境）**

## 📞 技术支持

如遇问题，请检查：
1. 网络连接状态
2. 防火墙配置
3. Docker服务状态
4. 日志输出信息

---

**祝测试顺利！🎉**
