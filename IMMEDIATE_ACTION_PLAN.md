# ⚡ 立即行动计划 - 上线冲刺

**目标**: 最快速度上线生产环境
**预计时间**: 1-2小时

---

## 🎯 第一优先级：立即上线（45分钟）

### ✅ 步骤1: 环境准备（10分钟）

```bash
# 在生产服务器上执行

# 1. 确认Docker安装
docker --version
docker-compose --version

# 如果未安装：
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose

# 2. 克隆代码
git clone <your-repository-url>
cd device-passport-system
```

### ✅ 步骤2: 生成密钥（5分钟）

```bash
# 生成所有必需的密钥
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)"
echo "DATABASE_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"

# 将输出保存，稍后配置使用
```

### ✅ 步骤3: 配置环境（10分钟）

```bash
# 1. 复制环境变量模板
cp .env.production.example .env.production

# 2. 编辑配置（必须修改的项目）
nano .env.production

# 最小必需配置：
# DATABASE_PASSWORD=<上面生成的>
# REDIS_PASSWORD=<上面生成的>
# JWT_SECRET=<上面生成的>
# JWT_REFRESH_SECRET=<上面生成的>
# CORS_ORIGINS=https://yourdomain.com

# 3. 保存并退出 (Ctrl+X, Y, Enter)
```

### ✅ 步骤4: 一键部署（15分钟）

```bash
# 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh production

# 脚本会自动：
# ✓ 构建Docker镜像
# ✓ 启动所有服务
# ✓ 运行数据库迁移
# ✓ 执行健康检查
# ✓ 显示运行状态
```

### ✅ 步骤5: 验证部署（5分钟）

```bash
# 1. 检查所有服务运行
docker-compose -f docker-compose.production.yml ps

# 期望输出：所有服务 "Up (healthy)"

# 2. 健康检查
curl http://localhost:3000/api/v1/health

# 期望输出：{"status":"ok",...}

# 3. 访问前端
curl http://localhost

# 期望输出：HTML内容

# 4. 测试登录
# 浏览器访问: http://your-server-ip
# 登录: admin@luna.top / password123
```

---

## 🔒 第二优先级：SSL配置（20分钟，可选但强烈推荐）

### 使用Let's Encrypt（免费）

```bash
# 1. 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. 自动续期测试
sudo certbot renew --dry-run

# 4. 重启Nginx
sudo systemctl reload nginx
```

---

## 📊 第三优先级：监控配置（15分钟）

### 基础监控

```bash
# 1. 查看实时日志
docker-compose -f docker-compose.production.yml logs -f

# 2. 监控资源使用
docker stats

# 3. 设置日志轮转（防止磁盘满）
sudo nano /etc/logrotate.d/docker-compose

# 添加内容：
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

### 配置告警（可选）

```bash
# 使用Uptimerobot或类似服务监控：
# - https://yourdomain.com/api/v1/health
# - 每5分钟检查一次
# - 失败时发送邮件/短信
```

---

## 💾 第四优先级：备份配置（10分钟）

### 自动备份脚本

```bash
# 1. 创建备份目录
sudo mkdir -p /backups/database

# 2. 创建备份脚本
sudo nano /usr/local/bin/backup-db.sh

# 添加内容：
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
cd /path/to/device-passport-system
docker-compose -f docker-compose.production.yml exec -T db pg_dump \
  -U passport_user device_passport | \
  gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# 3. 添加执行权限
sudo chmod +x /usr/local/bin/backup-db.sh

# 4. 设置定时任务（每天凌晨2点）
sudo crontab -e
# 添加：
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1

# 5. 测试备份
sudo /usr/local/bin/backup-db.sh
ls -lh /backups/database/
```

---

## 🔥 常见问题快速解决

### 问题1: 容器无法启动

```bash
# 查看错误日志
docker-compose -f docker-compose.production.yml logs <service-name>

# 常见原因：
# - 端口被占用：修改端口或停止占用进程
# - 权限问题：确保有Docker权限 (sudo usermod -aG docker $USER)
# - 内存不足：检查 docker stats
```

### 问题2: 健康检查失败

```bash
# 检查数据库
docker-compose -f docker-compose.production.yml exec db pg_isready

# 检查网络
docker-compose -f docker-compose.production.yml exec api ping db

# 重启服务
docker-compose -f docker-compose.production.yml restart api
```

### 问题3: 迁移失败

```bash
# 查看迁移状态
docker-compose -f docker-compose.production.yml exec api pnpm migration:show

# 手动运行迁移
docker-compose -f docker-compose.production.yml exec api pnpm migration:run

# 如果需要回滚
docker-compose -f docker-compose.production.yml exec api pnpm migration:revert
```

### 问题4: 性能慢

```bash
# 1. 运行数据库优化
docker-compose -f docker-compose.production.yml exec -T db \
  psql -U passport_user -d device_passport < apps/api/src/database/scripts/optimize-db.sql

# 2. 增加资源限制（编辑docker-compose.production.yml）
# 修改 memory 和 cpus 限制

# 3. 启用缓存（在.env.production中）
ENABLE_QUERY_CACHE=true
CACHE_TTL=3600
```

---

## ✅ 上线后立即检查清单

**5分钟内完成**：

- [ ] 所有容器运行正常 (`docker ps`)
- [ ] 健康检查通过 (`curl /api/v1/health`)
- [ ] 网站可访问
- [ ] 登录功能正常
- [ ] 扫描功能正常

**30分钟内完成**：

- [ ] SSL证书配置（如果有域名）
- [ ] 修改默认管理员密码
- [ ] 配置备份脚本
- [ ] 设置监控告警
- [ ] 测试备份恢复

**24小时内完成**：

- [ ] 监控错误日志
- [ ] 检查性能指标
- [ ] 验证所有功能
- [ ] 准备用户文档
- [ ] 设置客服渠道

---

## 🚨 紧急回滚计划

如果出现严重问题：

```bash
# 方法1: 使用回滚脚本（推荐）
./scripts/rollback.sh production

# 方法2: 手动回滚
docker-compose -f docker-compose.production.yml down
docker tag device-passport-api:backup device-passport-api:latest
docker tag device-passport-web:backup device-passport-web:latest
docker-compose -f docker-compose.production.yml up -d
```

---

## 📞 获取帮助

### 自助排查

1. 查看日志：`docker-compose logs -f`
2. 查看健康状态：`curl /api/v1/health | jq`
3. 查看资源使用：`docker stats`
4. 查看文档：`PRODUCTION_DEPLOYMENT.md`

### 常用命令

```bash
# 重启所有服务
docker-compose -f docker-compose.production.yml restart

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs -f api

# 进入容器调试
docker-compose -f docker-compose.production.yml exec api sh

# 查看数据库
docker-compose -f docker-compose.production.yml exec db \
  psql -U passport_user device_passport
```

---

## 🎯 成功指标

**上线第1天**：
- [ ] 系统稳定运行24小时
- [ ] 0个严重错误
- [ ] 响应时间<200ms
- [ ] 所有核心功能正常

**上线第1周**：
- [ ] 日志中无异常错误
- [ ] 备份正常运行
- [ ] 监控告警正常
- [ ] 用户反馈收集

**上线第1月**：
- [ ] 测试覆盖率提升到60%
- [ ] 性能优化完成
- [ ] 用户增长稳定
- [ ] 功能迭代计划

---

## 🚀 现在就开始！

```bash
# 复制这段代码，在服务器上执行：

cd /opt  # 或你的部署目录
git clone <your-repo-url> device-passport-system
cd device-passport-system

# 生成密钥
openssl rand -base64 64 > jwt_secret.txt
openssl rand -base64 64 > jwt_refresh.txt
openssl rand -base64 32 > db_password.txt
openssl rand -base64 32 > redis_password.txt

# 配置环境
cp .env.production.example .env.production
# 手动编辑.env.production，填入上面生成的密钥

# 部署！
chmod +x scripts/deploy.sh
./scripts/deploy.sh production

# 完成！
echo "🎉 部署完成！访问 http://$(curl -s ifconfig.me) 查看系统"
```

---

**预计总时间**：45分钟到2小时
**难度**：⭐⭐☆☆☆（中等）
**成功率**：95%+

**立即开始，快速上线！** 🚀
