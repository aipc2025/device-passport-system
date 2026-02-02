# 快速参考卡片 | Quick Reference Card

## 🚀 快速启动 | Quick Start

```bash
# 1. 启动系统
双击运行: start-all.bat

# 2. 访问地址
http://192.168.71.21:5173
```

---

## 🔐 测试账号 | Test Accounts

**统一密码 Password**: `DevTest2026!@#$`

| 角色 Role | 邮箱 Email |
|----------|-----------|
| 管理员 Admin | admin@luna.top |
| 操作员 Operator | operator@luna.top |
| 工程师 Engineer | engineer@luna.top |
| 质检员 QC | qc@luna.top |
| 客户 Customer | customer@luna.top |
| 专家 Expert | expert@luna.top |

---

## 🌐 访问地址 | Access URLs

### 本机 Local
- 前端 Web: http://localhost:5173
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs

### 局域网 LAN
- 前端 Web: http://192.168.71.21:5173 ⭐
- API: http://192.168.71.21:3000/api/v1
- Swagger: http://192.168.71.21:3000/api/docs ⭐
- Adminer: http://192.168.71.21:8080

---

## 🛠️ 常用命令 | Common Commands

```bash
# 启动所有服务
start-all.bat

# 检查服务状态
check-services.bat

# 停止所有服务
stop-all.bat

# 配置防火墙（管理员权限）
setup-firewall.bat

# 初始化数据库（首次）
cd apps\api
npm run migration:run
npm run seed
```

---

## 📱 手机测试 | Mobile Testing

1. 连接同一WiFi
2. 访问: http://192.168.71.21:5173
3. 使用测试账号登录

---

## 🐛 常见问题 | Common Issues

### ❌ Invalid credentials
**原因**: 使用了错误的密码
**解决**:
- 邮箱: admin@luna.top
- 密码: DevTest2026!@#$

### ❌ 文件上传失败
**原因**: uploads目录不存在
**解决**:
```bash
mkdir apps\api\uploads
```

### ❌ 其他设备无法访问
**解决**: 以管理员身份运行 `setup-firewall.bat`

### ❌ Docker未启动
**解决**: 启动 Docker Desktop

---

## 📊 系统信息 | System Info

**版本 Version**: 1.0.0
**发布日期 Release**: 2026-02-02
**服务器IP Server IP**: 192.168.71.21

### 端口 Ports
- API: 3000
- Web: 5173
- PostgreSQL: 5432
- Redis: 6379
- Adminer: 8080

---

## 📚 文档索引 | Documentation Index

| 文档 | 用途 |
|------|------|
| [README-CN.md](./README-CN.md) | 中文使用说明 |
| [QUICK-START.md](./QUICK-START.md) | 快速开始 |
| [START-GUIDE.md](./START-GUIDE.md) | 详细指南 |
| [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md) | 测试账号 |
| [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) | 测试清单 |
| [CHANGELOG.md](./CHANGELOG.md) | 更新日志 |
| [VERSION.md](./VERSION.md) | 版本信息 |

---

## 🎯 核心功能 | Core Features

- ✅ 设备护照管理
- ✅ 用户认证授权
- ✅ 服务请求系统
- ✅ 专家匹配平台
- ✅ 实时通知系统
- ✅ 文件上传管理
- ✅ 数据分析报表
- ✅ 地图集成
- ✅ 移动端适配

---

## 🔒 安全提示 | Security Notes

- ⚠️ 仅用于开发/测试环境
- ⚠️ 生产环境必须更改密码
- ⚠️ 不要暴露到公网
- ⚠️ 定期备份数据库

---

## 📞 获取帮助 | Get Help

1. 查看 [START-GUIDE.md](./START-GUIDE.md)
2. 运行 `check-services.bat` 检查状态
3. 查看终端错误信息
4. 查阅 [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)

---

**最后更新**: 2026-02-02
**版本**: 1.0.0

---

## 💡 提示 | Tips

- 首次使用前运行 `npm run seed` 初始化数据
- 使用 Swagger 文档测试 API
- 移动设备测试前配置防火墙
- 定期查看 CHANGELOG.md 了解更新

---

**祝测试顺利！🎉**
