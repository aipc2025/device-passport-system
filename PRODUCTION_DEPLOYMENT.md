# 生产部署指南

本指南将帮助你将设备护照系统部署到生产环境。

## 📋 部署前检查清单

### 1. 环境准备

- [ ] 服务器已准备（推荐: 4 CPU, 8GB RAM, 100GB SSD）
- [ ] Docker & Docker Compose 已安装
- [ ] SSL证书已获取（推荐: Let's Encrypt）
- [ ] 域名已配置DNS解析
- [ ] 防火墙规则已配置（开放80, 443端口）

### 2. 数据库准备

- [ ] PostgreSQL 16 已安装或使用Docker
- [ ] 数据库用户已创建（强密码）
- [ ] 数据库已创建
- [ ] 备份策略已制定

### 3. 配置文件

- [ ] `.env.production` 已从模板创建
- [ ] 所有密钥已生成（JWT_SECRET, DATABASE_PASSWORD等）
- [ ] CORS_ORIGINS 已配置正确的域名
- [ ] 邮件服务已配置（如需要）
- [ ] Sentry DSN 已配置（可选）

### 4. 安全检查

- [ ] 所有默认密码已更改
- [ ] JWT密钥足够强（64+字符）
- [ ] Rate limiting 已启用
- [ ] Helmet 安全头已启用
- [ ] HTTPS 已配置

### 5. 监控和日志

- [ ] 日志目录已配置
- [ ] 日志轮转已设置
- [ ] 监控告警已配置
- [ ] 备份脚本已测试

---

## 🚀 快速部署（推荐方式）

### 方法 1: 使用部署脚本

```bash
# 1. 克隆代码到服务器
git clone <repository-url>
cd device-passport-system

# 2. 复制并配置环境变量
cp .env.production.example .env.production
nano .env.production  # 编辑配置

# 3. 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 方法 2: 手动部署

```bash
# 1. 构建镜像
docker-compose -f docker-compose.production.yml build

# 2. 启动服务
docker-compose -f docker-compose.production.yml up -d

# 3. 运行数据库迁移
docker-compose -f docker-compose.production.yml exec api pnpm migration:run

# 4. 检查健康状态
curl http://localhost:3000/api/v1/health
```

---

## 🔧 详细配置步骤

### 1. 生成安全密钥

```bash
# 生成 JWT Secret (64字符)
openssl rand -base64 64

# 生成数据库密码 (32字符)
openssl rand -base64 32

# 生成 Redis 密码
openssl rand -base64 32
```

### 2. 配置 .env.production

```bash
# 复制模板
cp .env.production.example .env.production

# 必须修改的配置项:
# - DATABASE_PASSWORD (强密码)
# - REDIS_PASSWORD (强密码)
# - JWT_SECRET (使用上面生成的)
# - JWT_REFRESH_SECRET (使用上面生成的，与JWT_SECRET不同)
# - CORS_ORIGINS (你的域名，逗号分隔)
# - DATABASE_HOST (如果不用Docker)
# - REDIS_HOST (如果不用Docker)

# 推荐配置:
# - SENTRY_DSN (错误追踪)
# - EMAIL_* (邮件通知)
# - BACKUP_* (自动备份)
```

### 3. 配置 Nginx (如果使用反向代理)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }
}
```

### 4. 配置 SSL (使用 Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 数据库迁移

### 首次部署

```bash
# 运行所有迁移
docker-compose -f docker-compose.production.yml exec api pnpm migration:run

# 运行种子数据（仅首次）
docker-compose -f docker-compose.production.yml exec api pnpm db:seed
```

### 更新部署

```bash
# 只运行新的迁移
docker-compose -f docker-compose.production.yml exec api pnpm migration:run
```

### 回滚迁移

```bash
# 回滚最后一个迁移
docker-compose -f docker-compose.production.yml exec api pnpm migration:revert
```

---

## 🔄 CI/CD 配置

### GitHub Actions

1. 在 GitHub 仓库设置中添加 Secrets:
   ```
   DOCKER_USERNAME
   DOCKER_PASSWORD
   SSH_PRIVATE_KEY
   SERVER_HOST
   SERVER_USER
   APP_URL
   VITE_API_URL
   SLACK_WEBHOOK (可选)
   ```

2. 推送到 main 分支会自动触发部署

### 手动部署

```bash
# 在服务器上
cd device-passport-system
git pull origin main
./scripts/deploy.sh production
```

---

## 📈 监控和日志

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f web
docker-compose -f docker-compose.production.yml logs -f db

# 查看最近100行
docker-compose -f docker-compose.production.yml logs --tail=100
```

### 健康检查

```bash
# API 健康检查
curl http://localhost:3000/api/v1/health

# 详细健康信息
curl http://localhost:3000/api/v1/health | jq
```

### 资源使用监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h
```

---

## 💾 备份策略

### 数据库备份

```bash
# 手动备份
docker-compose -f docker-compose.production.yml exec -T db pg_dump \
  -U passport_user device_passport | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 恢复备份
gunzip < backup_20260202_120000.sql.gz | \
  docker-compose -f docker-compose.production.yml exec -T db \
  psql -U passport_user device_passport
```

### 自动备份脚本

创建 `/etc/cron.daily/backup-db`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/database"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR
cd /path/to/device-passport-system

# 备份数据库
docker-compose -f docker-compose.production.yml exec -T db pg_dump \
  -U passport_user device_passport | \
  gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 删除旧备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 上传到 S3 (可选)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/database/
```

---

## 🔥 故障排查

### 容器无法启动

```bash
# 查看容器状态
docker-compose -f docker-compose.production.yml ps

# 查看具体错误
docker-compose -f docker-compose.production.yml logs <service-name>

# 重启服务
docker-compose -f docker-compose.production.yml restart <service-name>
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose -f docker-compose.production.yml exec db pg_isready

# 检查网络连接
docker-compose -f docker-compose.production.yml exec api ping db

# 查看数据库日志
docker-compose -f docker-compose.production.yml logs db
```

### 性能问题

```bash
# 查看资源使用
docker stats

# 查看慢查询 (PostgreSQL)
docker-compose -f docker-compose.production.yml exec db \
  psql -U passport_user -d device_passport -c \
  "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# 重启所有服务
docker-compose -f docker-compose.production.yml restart
```

### 回滚部署

```bash
# 使用回滚脚本
./scripts/rollback.sh production

# 或手动回滚
docker-compose -f docker-compose.production.yml down
docker tag device-passport-api:backup device-passport-api:latest
docker tag device-passport-web:backup device-passport-web:latest
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔐 安全最佳实践

### 1. 定期更新

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新 Docker 镜像
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### 2. 防火墙配置

```bash
# 使用 UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. 定期检查

- [ ] 每周检查日志中的异常
- [ ] 每月检查安全更新
- [ ] 每季度进行安全审计
- [ ] 定期测试备份恢复

---

## 📞 获取帮助

- **文档**: 查看 `VERIFICATION_REPORT.md` 和 `QUICK_START.md`
- **GitHub Issues**: 报告问题和功能请求
- **日志**: 优先检查日志文件

---

## 🎯 性能优化建议

### 数据库优化

```sql
-- 创建额外索引（根据实际查询调整）
CREATE INDEX CONCURRENTLY idx_device_passport_created_at ON device_passport(created_at DESC);
CREATE INDEX CONCURRENTLY idx_lifecycle_event_date ON lifecycle_event(event_date DESC);

-- 定期 VACUUM
VACUUM ANALYZE;
```

### Redis 缓存

在 .env.production 中启用:
```
ENABLE_QUERY_CACHE=true
CACHE_TTL=3600
```

### 负载均衡

如果流量增大，考虑：
- 增加 API 容器副本
- 使用 Nginx 负载均衡
- 配置 CDN（静态资源）

---

## ✅ 部署完成检查

部署后验证以下项目：

- [ ] 网站可以访问 (https://yourdomain.com)
- [ ] API 响应正常 (https://yourdomain.com/api/v1/health)
- [ ] 登录功能正常
- [ ] 护照扫描功能正常
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] SSL 证书有效
- [ ] 日志正常记录
- [ ] 备份脚本运行正常
- [ ] 监控告警正常

---

祝你部署顺利！🚀
