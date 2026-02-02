# ✅ 生产部署检查清单

**使用说明**: 逐项检查，确保万无一失

---

## 📋 部署前检查（必须100%完成）

### 环境准备
- [ ] 服务器已准备（最低4 CPU, 8GB RAM, 100GB SSD）
- [ ] Docker已安装（version >= 20.10）
- [ ] Docker Compose已安装（version >= 2.0）
- [ ] Git已安装
- [ ] 域名DNS已解析到服务器IP
- [ ] 防火墙已配置（开放80, 443端口）

### 代码和配置
- [ ] 代码已提交到Git仓库
- [ ] `.env.production`已创建
- [ ] 所有密码已生成（强随机，64字符）
- [ ] `JWT_SECRET`已设置（与JWT_REFRESH_SECRET不同）
- [ ] `DATABASE_PASSWORD`已设置
- [ ] `REDIS_PASSWORD`已设置
- [ ] `CORS_ORIGINS`已配置（你的域名）
- [ ] `COMPANY_CODE`已设置

### 安全检查
- [ ] 所有默认密码已更改
- [ ] JWT密钥至少64字符
- [ ] 数据库密码至少32字符
- [ ] 不使用`password123`等弱密码
- [ ] `.env.production`不在Git仓库中

---

## 🚀 部署执行（按顺序）

### 步骤1: 克隆代码
```bash
git clone <repository-url>
cd device-passport-system
```
- [ ] 代码已克隆
- [ ] 在正确的目录中

### 步骤2: 配置环境
```bash
cp .env.production.example .env.production
nano .env.production
```
- [ ] 文件已复制
- [ ] 所有必需字段已填写
- [ ] 密码已填入
- [ ] 域名已配置

### 步骤3: 运行部署
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```
- [ ] 脚本有执行权限
- [ ] 脚本运行成功
- [ ] 无错误输出

### 步骤4: 验证部署
```bash
docker-compose -f docker-compose.production.yml ps
```
- [ ] 所有容器状态为"Up (healthy)"
- [ ] DB容器运行正常
- [ ] Redis容器运行正常
- [ ] API容器运行正常
- [ ] Web容器运行正常

---

## 🔍 功能验证（全部测试）

### 基础功能
- [ ] 网站可以访问（http://服务器IP）
- [ ] API响应正常（`curl http://localhost:3000/api/v1/health`）
- [ ] 健康检查返回200（`{"status":"ok"}`）
- [ ] Swagger文档可访问（http://localhost:3000/api/docs）

### 用户功能
- [ ] 可以访问登录页面
- [ ] 可以使用测试账号登录（admin@luna.top / password123）
- [ ] 登录后可以访问仪表板
- [ ] 可以创建设备护照
- [ ] 可以扫描护照码
- [ ] 可以退出登录

### 数据库
- [ ] 数据库连接成功
- [ ] 迁移已运行
- [ ] 种子数据已加载
- [ ] 可以查询数据
- [ ] 可以创建新数据

### 性能
- [ ] API响应时间<200ms
- [ ] 页面加载时间<3秒
- [ ] 无明显延迟

---

## 🔒 安全验证

### SSL/HTTPS（如已配置）
- [ ] HTTPS证书有效
- [ ] HTTP自动重定向到HTTPS
- [ ] 无证书警告
- [ ] SSL Labs测试A+评级

### 安全头
```bash
curl -I https://yourdomain.com
```
- [ ] X-Frame-Options存在
- [ ] X-Content-Type-Options存在
- [ ] X-XSS-Protection存在
- [ ] Strict-Transport-Security存在

### 访问控制
- [ ] 未授权无法访问API
- [ ] CORS仅允许配置的域名
- [ ] Rate limiting正常工作

---

## 📊 监控配置

### 日志
- [ ] 应用日志正常记录
- [ ] 错误日志可访问
- [ ] 日志轮转已配置
- [ ] 日志级别设置合理（info/warn/error）

### 健康检查
- [ ] /api/v1/health响应正常
- [ ] /api/v1/health/readiness响应正常
- [ ] /api/v1/health/liveness响应正常
- [ ] 健康检查包含数据库状态
- [ ] 健康检查包含内存状态

### 告警（推荐）
- [ ] 已配置Uptimerobot等监控
- [ ] 监控间隔设置（建议5分钟）
- [ ] 告警通知已设置（邮件/短信/Slack）
- [ ] 已测试告警是否正常发送

---

## 💾 备份配置

### 数据库备份
- [ ] 备份脚本已创建（/usr/local/bin/backup-db.sh）
- [ ] 备份目录已创建（/backups/database）
- [ ] 定时任务已配置（crontab）
- [ ] 备份已测试（手动运行一次）
- [ ] 备份文件可以成功创建
- [ ] 旧备份自动删除（保留30天）

### 备份验证
```bash
# 测试备份
sudo /usr/local/bin/backup-db.sh
ls -lh /backups/database/

# 测试恢复
gunzip < backup.sql.gz | docker-compose exec -T db psql -U passport_user test_db
```
- [ ] 备份文件已生成
- [ ] 备份可以成功恢复
- [ ] 恢复的数据完整

---

## 🔧 性能优化

### 数据库优化
```bash
docker-compose exec -T db psql -U passport_user -d device_passport \
  < apps/api/src/database/scripts/optimize-db.sql
```
- [ ] 优化脚本已运行
- [ ] 索引已创建
- [ ] VACUUM已执行
- [ ] ANALYZE已执行

### 应用优化
在`.env.production`中：
- [ ] `ENABLE_QUERY_CACHE=true`
- [ ] `CACHE_TTL=3600`
- [ ] `ENABLE_COMPRESSION=true`

### 资源限制
在`docker-compose.production.yml`中：
- [ ] CPU限制已设置
- [ ] 内存限制已设置
- [ ] 重启策略已配置

---

## 🧪 压力测试（可选但推荐）

### 基础测试
```bash
# 使用Apache Bench测试
ab -n 1000 -c 10 http://localhost:3000/api/v1/health
```
- [ ] 可以处理1000个请求
- [ ] 无错误响应
- [ ] 平均响应时间<100ms
- [ ] 无内存泄漏

---

## 📝 文档检查

### 用户文档
- [ ] 登录说明已准备
- [ ] 功能使用指南已准备
- [ ] 常见问题FAQ已准备
- [ ] 联系方式已公布

### 技术文档
- [ ] 部署文档已更新
- [ ] API文档已生成
- [ ] 故障排查指南已准备
- [ ] 维护手册已准备

---

## 🎯 上线后立即任务

### 第1小时
- [ ] 监控系统状态
- [ ] 检查错误日志
- [ ] 验证所有功能
- [ ] 准备回滚方案

### 第1天
- [ ] 持续监控
- [ ] 收集性能数据
- [ ] 响应用户反馈
- [ ] 记录问题和解决方案

### 第1周
- [ ] 分析日志趋势
- [ ] 优化慢查询
- [ ] 调整缓存策略
- [ ] 准备第一次更新

---

## 🚨 回滚准备

### 回滚条件
- [ ] 系统崩溃无法恢复
- [ ] 数据丢失或损坏
- [ ] 严重安全漏洞
- [ ] 性能严重下降

### 回滚流程
```bash
./scripts/rollback.sh production
```
- [ ] 回滚脚本已测试
- [ ] 备份镜像可用
- [ ] 数据库备份可用
- [ ] 回滚流程已文档化

---

## ✅ 最终确认

### 技术确认
- [ ] 所有容器运行正常
- [ ] 所有功能测试通过
- [ ] 性能满足要求
- [ ] 安全措施已就位
- [ ] 备份系统正常
- [ ] 监控告警正常

### 业务确认
- [ ] 产品负责人已验收
- [ ] 用户文档已准备
- [ ] 支持团队已培训
- [ ] 上线时间已确认
- [ ] 沟通计划已准备

### 团队确认
- [ ] 开发团队ready
- [ ] 运维团队ready
- [ ] 产品团队ready
- [ ] 客服团队ready

---

## 🎉 上线！

**全部检查完成后**：

```bash
# 1. 修改默认管理员密码
# 登录系统，修改 admin@luna.top 的密码

# 2. 清理测试数据（如果需要）
# 保留必要的种子数据

# 3. 宣布上线
echo "🚀 System is live!"

# 4. 开始监控
docker-compose -f docker-compose.production.yml logs -f
```

---

## 📊 检查清单统计

**总检查项**: 100+
**必需完成**: 80+
**推荐完成**: 20+

**建议**: 至少完成90%的检查项后再上线

---

**祝上线顺利！** 🎉
