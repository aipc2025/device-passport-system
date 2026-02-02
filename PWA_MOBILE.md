# PWA和移动端适配 - 完整实现文档

## 概述

设备护照系统现已完全支持Progressive Web App (PWA)功能和移动端优化，可作为原生应用安装到用户设备上，并提供离线支持和推送通知。

**实现时间**: 2026-02-02
**状态**: ✅ 完成并可用

---

## PWA功能特性

### 1. 可安装性
- ✅ Web App Manifest配置
- ✅ 添加到主屏幕提示
- ✅ 自定义应用图标和启动画面
- ✅ 独立窗口运行（无浏览器UI）
- ✅ 快捷方式支持

### 2. 离线支持
- ✅ Service Worker缓存策略
- ✅ 离线页面访问
- ✅ 离线状态提示
- ✅ 后台同步（Background Sync）
- ✅ IndexedDB数据持久化

### 3. 性能优化
- ✅ 资源缓存（Cache API）
- ✅ 网络优先/缓存优先策略
- ✅ 预缓存关键资源
- ✅ 懒加载非关键资源

### 4. 原生体验
- ✅ 推送通知支持
- ✅ 离线横幅提示
- ✅ 更新提示
- ✅ 独立窗口模式
- ✅ 状态栏颜色定制

---

## 移动端适配

### 1. 响应式布局
- ✅ Mobile-first设计
- ✅ 触摸友好的tap targets (最小44x44px)
- ✅ 自适应导航
- ✅ 底部导航栏
- ✅ 汉堡菜单

### 2. 触摸手势
- ✅ 滑动导航
- ✅ 双击放大
- ✅ 捏合缩放
- ✅ 下拉刷新
- ✅ 触摸反馈

### 3. 移动端优化
- ✅ 防止缩放输入框(iOS)
- ✅ Safe Area支持(iPhone X+刘海屏)
- ✅ 横竖屏适配
- ✅ 隐藏滚动条
- ✅ 平滑滚动

### 4. 性能优化
- ✅ 懒加载图片
- ✅ 代码分割
- ✅ 虚拟滚动
- ✅ 防抖/节流
- ✅ 骨架屏加载

---

## 文件结构

```
apps/web/
├── public/
│   ├── manifest.json              # PWA清单文件
│   ├── service-worker.js          # Service Worker
│   └── icons/                     # 应用图标
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   ├── components/
│   │   └── Mobile/
│   │       ├── InstallPrompt.tsx      # 安装提示横幅
│   │       ├── MobileNav.tsx          # 移动端导航
│   │       ├── TouchGestures.tsx      # 触摸手势组件
│   │       ├── OfflineBanner.tsx      # 离线提示
│   │       ├── UpdatePrompt.tsx       # 更新提示
│   │       └── index.ts
│   ├── hooks/
│   │   └── usePWA.ts                  # PWA相关Hooks
│   └── styles/
│       └── mobile.css                 # 移动端专用样式
```

---

## PWA Manifest配置

**位置**: `apps/web/public/manifest.json`

### 关键配置项

```json
{
  "name": "Device Passport System",
  "short_name": "DevPassport",
  "display": "standalone",          // 独立窗口运行
  "theme_color": "#3b82f6",         // 状态栏颜色
  "background_color": "#ffffff",    // 启动画面背景
  "orientation": "portrait-primary", // 默认竖屏
  "scope": "/",
  "start_url": "/",
  "icons": [...],
  "shortcuts": [                     // 应用快捷方式
    {
      "name": "Scan Device",
      "url": "/scan",
      "icons": [...]
    }
  ]
}
```

---

## Service Worker策略

**位置**: `apps/web/public/service-worker.js`

### 缓存策略

#### 1. 静态资源 - Cache First
```javascript
// 优先从缓存读取，失败则从网络获取
caches.match(request)
  .then(response => response || fetch(request))
```

#### 2. API请求 - Network First
```javascript
// 优先从网络获取，失败则从缓存读取
fetch(request)
  .then(response => {
    cache.put(request, response.clone());
    return response;
  })
  .catch(() => caches.match(request))
```

### 功能

1. **预缓存关键资源**
   - index.html
   - manifest.json
   - 应用图标
   - 主要CSS/JS文件

2. **离线支持**
   - 缓存已访问页面
   - 离线时显示缓存版本
   - 后台同步待提交数据

3. **推送通知**
   - 接收服务端推送
   - 显示通知
   - 点击通知跳转

4. **后台同步**
   - 离线时存储表单数据
   - 恢复网络后自动提交
   - 使用IndexedDB持久化

---

## React Hooks

### 1. usePWA Hook

**位置**: `apps/web/src/hooks/usePWA.ts`

**功能**:
```typescript
const {
  isInstallable,    // 是否可以安装
  isInstalled,      // 是否已安装
  isStandalone,     // 是否以独立模式运行
  promptInstall     // 触发安装提示
} = usePWA();
```

**使用示例**:
```tsx
function InstallButton() {
  const { isInstallable, promptInstall } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      alert('安装成功！');
    }
  };

  return (
    <button onClick={handleInstall}>
      安装应用
    </button>
  );
}
```

### 2. useOnlineStatus Hook

**功能**: 监听网络连接状态

```typescript
const isOnline = useOnlineStatus();

return (
  <div>
    {isOnline ? '在线' : '离线'}
  </div>
);
```

### 3. useServiceWorker Hook

**功能**: 管理Service Worker更新

```typescript
const {
  registration,         // Service Worker注册对象
  updateAvailable,      // 是否有新版本
  updateServiceWorker   // 触发更新
} = useServiceWorker();
```

---

## 移动端组件

### 1. InstallPrompt

**位置**: `apps/web/src/components/Mobile/InstallPrompt.tsx`

**功能**:
- 显示底部安装横幅
- 仅在移动设备上显示
- 可关闭并记住用户选择
- 自动检测是否已安装

**集成**:
```tsx
import { InstallPrompt } from './components/Mobile';

function App() {
  return (
    <>
      <YourApp />
      <InstallPrompt />
    </>
  );
}
```

### 2. MobileNav

**功能**:
- 顶部固定导航栏
- 底部Tab导航
- 侧边抽屉菜单
- 用户信息显示

**特性**:
- 自动隐藏在桌面端
- Safe Area支持
- 当前路由高亮
- 通知徽章

### 3. TouchGestures

**功能**:
- 滑动手势检测
- 双击检测
- 捏合缩放
- 触摸反馈

**API**:
```tsx
<TouchGestures
  onSwipeLeft={() => console.log('Left')}
  onSwipeRight={() => console.log('Right')}
  onSwipeUp={() => console.log('Up')}
  onSwipeDown={() => console.log('Down')}
  onPinch={(scale) => console.log('Pinch:', scale)}
  onDoubleTap={() => console.log('Double tap')}
  threshold={50}
>
  <YourContent />
</TouchGestures>
```

**使用示例**:
```tsx
// 图片查看器 with 滑动切换
function ImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <TouchGestures
      onSwipeLeft={() => setCurrentIndex(i => Math.min(i + 1, images.length - 1))}
      onSwipeRight={() => setCurrentIndex(i => Math.max(i - 1, 0))}
      onDoubleTap={() => console.log('Zoom')}
    >
      <img src={images[currentIndex]} />
    </TouchGestures>
  );
}
```

### 4. OfflineBanner

**功能**:
- 检测网络状态
- 显示离线/在线提示
- 自动消失（重连后3秒）

### 5. UpdatePrompt

**功能**:
- 检测应用更新
- 提示用户更新
- 一键刷新到新版本

---

## 移动端样式

**位置**: `apps/web/src/styles/mobile.css`

### 关键工具类

```css
/* Safe Area (刘海屏支持) */
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* 触摸目标 (最小44x44px) */
.tap-target { min-height: 44px; min-width: 44px; }

/* 防止选中文本 */
.no-select { user-select: none; }

/* 平滑滚动 */
.smooth-scroll { scroll-behavior: smooth; }

/* 隐藏滚动条 */
.hide-scrollbar { scrollbar-width: none; }

/* 触摸反馈 */
.haptic:active { transform: scale(0.95); }

/* 骨架屏加载 */
.skeleton { animation: loading 1.5s ease-in-out infinite; }
```

### 响应式工具

```css
/* 横竖屏 */
.portrait-only { display: block; }  @media (landscape)
.landscape-only { display: none; }  @media (portrait)

/* PWA模式 */
.pwa-only { display: block; }  @media (display-mode: standalone)
.browser-only { display: none; } @media (display-mode: browser)
```

---

## 移动端检测

### useMobileDetect Hook

```typescript
const {
  isMobile,    // 手机
  isTablet,    // 平板
  isIOS,       // iOS设备
  isAndroid,   // Android设备
  isDesktop    // 桌面
} = useMobileDetect();
```

**使用示例**:
```tsx
function ResponsiveComponent() {
  const { isMobile, isTablet } = useMobileDetect();

  if (isMobile) {
    return <MobileView />;
  }

  if (isTablet) {
    return <TabletView />;
  }

  return <DesktopView />;
}
```

---

## 集成指南

### 1. 在入口文件中注册Service Worker

**apps/web/src/main.tsx**:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/mobile.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. 在HTML中添加Manifest链接

**apps/web/index.html**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">

  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Theme color -->
  <meta name="theme-color" content="#3b82f6">

  <!-- iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="DevPassport">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">

  <!-- Android -->
  <meta name="mobile-web-app-capable" content="yes">

  <title>Device Passport System</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 3. 在App中添加移动端组件

**apps/web/src/App.tsx**:
```tsx
import { BrowserRouter } from 'react-router-dom';
import {
  InstallPrompt,
  MobileNav,
  OfflineBanner,
  UpdatePrompt
} from './components/Mobile';

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <MobileNav />

      <main className="mobile-content">
        <Routes>
          {/* Your routes */}
        </Routes>
      </main>

      <InstallPrompt />
      <UpdatePrompt />
    </BrowserRouter>
  );
}
```

---

## 测试PWA

### 1. 本地测试

```bash
# 开发环境
pnpm dev

# 生产构建
pnpm build
pnpm preview
```

访问 `http://localhost:5173`

### 2. 使用Chrome DevTools

1. 打开 DevTools (F12)
2. 切换到 **Application** 标签
3. 查看:
   - Manifest
   - Service Workers
   - Cache Storage
   - IndexedDB

### 3. Lighthouse审计

1. DevTools > Lighthouse
2. 选择 "Progressive Web App"
3. 运行审计
4. 目标: 90+ 分数

### 4. 移动设备测试

#### Android:
1. Chrome访问应用
2. 点击菜单 > "添加到主屏幕"
3. 从主屏幕打开应用

#### iOS:
1. Safari访问应用
2. 点击分享按钮
3. "添加到主屏幕"
4. 从主屏幕打开应用

---

## 性能优化

### 1. 代码分割

```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 2. 图片优化

```tsx
<img
  src="/images/low-res.jpg"
  srcSet="/images/high-res.jpg 2x"
  loading="lazy"
  alt="Device"
/>
```

### 3. 虚拟滚动

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={80}
>
  {Row}
</FixedSizeList>
```

---

## 推送通知

### 1. 请求权限

```typescript
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted');
  }
}
```

### 2. 订阅推送

```typescript
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_PUBLIC_KEY'
  });

  // 发送订阅信息到服务器
  await fetch('/api/v1/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 3. 显示通知

```typescript
// 在Service Worker中
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

---

## 离线数据同步

### 1. 保存待同步数据

```typescript
// 离线时保存表单数据
async function saveOfflineData(data: any) {
  const db = await openDB('device-passport-db', 1);
  const tx = db.transaction('pending-requests', 'readwrite');
  await tx.store.add({
    timestamp: Date.now(),
    data
  });
  await tx.done;

  // 注册后台同步
  if ('sync' in registration) {
    await registration.sync.register('sync-service-requests');
  }
}
```

### 2. 后台同步处理

```typescript
// Service Worker中
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-service-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  const db = await openDB('device-passport-db', 1);
  const pending = await db.getAll('pending-requests');

  for (const item of pending) {
    try {
      const response = await fetch('/api/v1/service-request/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        await db.delete('pending-requests', item.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

---

## 故障排查

### 问题1: Service Worker不工作

**解决方案**:
- 确保使用HTTPS (或localhost)
- 检查Service Worker路径正确
- 清除浏览器缓存
- 在DevTools中手动更新Service Worker

### 问题2: 无法安装PWA

**原因**:
- 没有有效的manifest.json
- 缺少Service Worker
- 未使用HTTPS
- manifest中缺少必需字段

**解决方案**:
- 运行Lighthouse检查
- 确保所有图标存在
- 验证manifest.json语法

### 问题3: iOS不显示安装提示

**原因**: iOS不支持`beforeinstallprompt`事件

**解决方案**:
- 提供手动安装指引
- 检测iOS设备并显示说明
- 使用"添加到主屏幕"按钮引导

### 问题4: 推送通知不工作

**检查**:
- 用户是否授予通知权限
- Service Worker是否正确注册
- 推送订阅是否成功
- 服务端推送配置

---

## 最佳实践

### 1. 渐进增强
- 基础功能在所有设备上工作
- PWA功能作为增强体验
- 优雅降级处理

### 2. 性能优先
- 首次加载 < 3秒
- 交互响应 < 100ms
- 使用骨架屏提升感知速度

### 3. 离线体验
- 关键页面可离线访问
- 明确提示用户离线状态
- 后台同步提交数据

### 4. 移动端优化
- 44x44px最小触摸目标
- 避免横向滚动
- 优化表单输入体验
- 使用原生控件

### 5. 测试覆盖
- 多种设备测试
- 不同网络环境
- 横竖屏切换
- 离线场景

---

## 浏览器兼容性

| 功能 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅* | ✅ | ✅ |
| Push Notifications | ✅ | ✅** | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Install Prompt | ✅ | ❌*** | ✅ | ✅ |

\* iOS 11.3+
\*\* iOS 16.4+
\*\*\* 使用手动安装流程

---

## 未来增强

### Phase 2
- [ ] Web Share API集成
- [ ] Badging API (应用图标徽章)
- [ ] Periodic Background Sync
- [ ] File System Access API

### Phase 3
- [ ] Web Bluetooth (设备扫描)
- [ ] WebNFC (NFC标签)
- [ ] Contact Picker API
- [ ] Payment Request API

---

## 总结

PWA和移动端适配已完成，提供:

✅ 完整的PWA支持 (可安装、离线、推送)
✅ 移动端优化 (响应式、触摸手势、性能)
✅ 原生应用体验
✅ 离线数据同步
✅ 跨平台兼容

所有功能已经过测试，可直接投入生产使用。

---

**文档版本**: 1.0
**最后更新**: 2026-02-02
**技术支持**: 查看源代码和TypeScript类型定义
