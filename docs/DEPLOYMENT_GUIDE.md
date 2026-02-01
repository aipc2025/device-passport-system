# Device Passport System - 部署指南

## 一、本地开发环境启动步骤

### 1. 环境要求

| 软件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18.x | 20.x LTS |
| PostgreSQL | 14.x | 16.x |
| Redis | 6.x | 7.x |
| pnpm | 8.x | 9.x |

### 2. 启动步骤

```bash
# 步骤 1: 进入项目目录
cd D:\device-passport-system

# 步骤 2: 安装依赖 (首次运行或依赖更新后)
pnpm install

# 步骤 3: 确保数据库和Redis运行中
# Windows: 检查PostgreSQL和Redis服务
# Docker方式:
docker-compose up -d db redis

# 步骤 4: 运行数据库迁移和种子数据 (首次运行)
pnpm db:seed

# 步骤 5: 启动所有服务
pnpm dev
```

### 3. 服务端口

| 服务 | 端口 | 地址 |
|------|------|------|
| API Server | 3000 | http://localhost:3000 |
| Swagger API文档 | 3000 | http://localhost:3000/api |
| Web Frontend | 5173/5187 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

## 二、功能测试清单

### A. 用户认证模块

| # | 测试项 | 测试步骤 | 预期结果 |
|---|--------|----------|----------|
| 1 | 公司注册 | 访问 /register → 选择Company | 可填写公司信息并提交 |
| 2 | 专家注册 | 访问 /register → 选择Expert | 可填写专家信息并提交 |
| 3 | 用户登录 | 访问 /login → 输入凭证 | 登录成功跳转首页 |
| 4 | 密码要求 | 注册时输入少于8位密码 | 提示密码长度不足 |

**测试账号:**
- 管理员: `admin@luna.top` / `admin123`
- 操作员: `operator@luna.top` / `operator123`
- 客户: `customer@luna.top` / `customer123`

### B. B2B撮合平台模块

| # | 测试项 | 测试步骤 | 预期结果 |
|---|--------|----------|----------|
| 1 | 产品列表 | 访问 /marketplace/products | 显示公开产品列表 |
| 2 | 发布产品 | 登录供应商账号 → 发布产品 | 产品创建成功 |
| 3 | RFQ列表 | 访问 /marketplace/rfqs | 显示采购需求列表 |
| 4 | 发布RFQ | 登录采购商账号 → 发布需求 | RFQ创建成功 |
| 5 | 创建询盘 | 点击产品 → 发送询盘 | 询盘创建成功 |
| 6 | 发送报价 | 供应商回复询盘 | 消息发送成功 |

### C. 服务请求模块

| # | 测试项 | 测试步骤 | 预期结果 |
|---|--------|----------|----------|
| 1 | 无护照请求 | /service-request → 勾选无护照码 | 可提交请求 |
| 2 | 有护照请求 | 输入有效护照码 | 关联设备信息 |
| 3 | 上传附件 | 上传图片/PDF | 文件上传成功 |
| 4 | 地图选点 | 点击地图选择位置 | 自动填充地址 |

### D. 设备护照模块

| # | 测试项 | 测试步骤 | 预期结果 |
|---|--------|----------|----------|
| 1 | 扫码查询 | GET /api/v1/scan/{code} | 返回设备公开信息 |
| 2 | 创建护照 | 操作员创建新护照 | 生成护照码 |
| 3 | 状态更新 | 更新设备状态 | 状态流转正确 |

---

## 三、云服务器配置推荐

### 方案一: 入门级 (10-50用户)

| 配置项 | 规格 | 月费用(约) |
|--------|------|-----------|
| **云服务商** | 阿里云/腾讯云 | - |
| **实例类型** | 2核4G | ¥100-150 |
| **系统盘** | 50GB SSD | 含在实例 |
| **数据盘** | 100GB SSD | ¥30-50 |
| **带宽** | 5Mbps | ¥50-80 |
| **数据库** | 自建PostgreSQL | 含在实例 |
| **缓存** | 自建Redis | 含在实例 |
| **总计** | - | **¥180-280/月** |

### 方案二: 标准级 (50-200用户) ⭐推荐

| 配置项 | 规格 | 月费用(约) |
|--------|------|-----------|
| **云服务商** | 阿里云/腾讯云 | - |
| **实例类型** | 4核8G | ¥300-400 |
| **系统盘** | 50GB SSD | 含在实例 |
| **数据盘** | 200GB SSD | ¥60-80 |
| **带宽** | 10Mbps | ¥100-150 |
| **RDS数据库** | PostgreSQL 2核4G | ¥200-300 |
| **Redis** | 1G标准版 | ¥80-100 |
| **OSS存储** | 50GB | ¥10-20 |
| **总计** | - | **¥750-1050/月** |

### 方案三: 生产级 (200+用户)

| 配置项 | 规格 | 月费用(约) |
|--------|------|-----------|
| **实例类型** | 8核16G × 2 | ¥1200-1600 |
| **负载均衡** | SLB | ¥50-100 |
| **RDS数据库** | PostgreSQL 4核8G 高可用 | ¥600-800 |
| **Redis** | 4G 集群版 | ¥300-400 |
| **OSS存储** | 200GB + CDN | ¥100-200 |
| **总计** | - | **¥2250-3100/月** |

---

## 四、部署步骤 (方案二为例)

### 步骤 1: 购买云资源

1. **购买ECS实例**
   - 地域: 选择离用户近的区域 (如华南-广州)
   - 实例: ecs.c6.xlarge (4核8G)
   - 系统: Ubuntu 22.04 LTS
   - 安全组: 开放 22(SSH), 80(HTTP), 443(HTTPS), 3000(API)

2. **购买RDS PostgreSQL**
   - 版本: PostgreSQL 16
   - 规格: 2核4G
   - 存储: 100GB SSD

3. **购买Redis**
   - 版本: Redis 7.0
   - 规格: 1GB 标准版

4. **购买域名** (如: device-passport.com)
   - 完成ICP备案 (中国大陆必须)

### 步骤 2: 服务器环境配置

```bash
# SSH连接服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装pnpm
npm install -g pnpm

# 安装Nginx
apt install -y nginx

# 安装PM2进程管理器
npm install -g pm2

# 安装Git
apt install -y git
```

### 步骤 3: 部署代码

```bash
# 创建应用目录
mkdir -p /var/www/device-passport
cd /var/www/device-passport

# 克隆代码 (或上传)
git clone https://your-repo-url.git .

# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

### 步骤 4: 配置环境变量

```bash
# 创建环境配置文件
cat > /var/www/device-passport/apps/api/.env << 'EOF'
# Database
DATABASE_HOST=your-rds-endpoint.rds.aliyuncs.com
DATABASE_PORT=5432
DATABASE_USERNAME=passport_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=device_passport

# Redis
REDIS_HOST=your-redis-endpoint.redis.rds.aliyuncs.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_very_long_random_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000

# Upload
UPLOAD_DIR=/var/www/device-passport/uploads
MAX_FILE_SIZE=10485760
EOF

# 前端环境变量
cat > /var/www/device-passport/apps/web/.env.production << 'EOF'
VITE_API_URL=https://api.your-domain.com
EOF
```

### 步骤 5: 初始化数据库

```bash
cd /var/www/device-passport

# 运行数据库迁移
pnpm db:migrate

# 运行种子数据
pnpm db:seed
```

### 步骤 6: 使用PM2启动服务

```bash
# 创建PM2配置
cat > /var/www/device-passport/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'device-passport-api',
      cwd: '/var/www/device-passport/apps/api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

# 启动服务
pm2 start ecosystem.config.js

# 保存PM2配置 (开机自启)
pm2 save
pm2 startup
```

### 步骤 7: 配置Nginx反向代理

```bash
cat > /etc/nginx/sites-available/device-passport << 'EOF'
# API服务
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }
}

# 前端服务
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/device-passport/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads {
        alias /var/www/device-passport/uploads;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/device-passport /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 步骤 8: 配置SSL证书 (HTTPS)

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 五、部署后验证清单

| # | 验证项 | 命令/操作 | 预期结果 |
|---|--------|----------|----------|
| 1 | API健康检查 | `curl https://api.your-domain.com/api` | 返回Swagger页面 |
| 2 | 前端访问 | 浏览器访问 https://your-domain.com | 显示首页 |
| 3 | 用户注册 | 注册新公司账号 | 注册成功 |
| 4 | 用户登录 | 登录测试账号 | 登录成功 |
| 5 | 文件上传 | 上传图片测试 | 上传成功 |
| 6 | 数据库连接 | 查看PM2日志 | 无错误日志 |

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs device-passport-api

# 查看Nginx日志
tail -f /var/log/nginx/error.log
```

---

## 六、维护命令

```bash
# 更新代码
cd /var/www/device-passport
git pull
pnpm install
pnpm build
pm2 restart all

# 查看服务状态
pm2 status
pm2 monit

# 数据库备份
pg_dump -h your-rds-host -U passport_user device_passport > backup_$(date +%Y%m%d).sql

# 清理日志
pm2 flush
```

---

## 七、常见问题

### Q1: 502 Bad Gateway
- 检查PM2是否运行: `pm2 status`
- 检查端口是否正确: `netstat -tlnp | grep 3000`

### Q2: 数据库连接失败
- 检查RDS安全组是否允许ECS IP
- 检查.env中数据库配置是否正确

### Q3: 文件上传失败
- 检查uploads目录权限: `chmod 755 /var/www/device-passport/uploads`
- 检查Nginx配置的client_max_body_size

### Q4: HTTPS证书问题
- 运行 `certbot renew` 续期
- 检查Nginx配置是否正确
