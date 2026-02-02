# 地图功能和GPS定位 - 完整实现文档

## 概述

本文档详细说明了设备护照系统中新增的地图功能和GPS定位功能，包括前端组件、后端API、使用示例和测试。

**实现时间**: 2026-02-02
**状态**: ✅ 完成并可用

---

## 功能特性

### 1. 交互式地图显示
- 基于 Leaflet.js 的完整地图集成
- OpenStreetMap 瓦片图层支持
- 自定义标记图标（设备、专家、服务请求）
- 支持缩放、平移、标记点击

### 2. 位置选择器
- 点击地图选择位置
- 地址搜索（通过 Nominatim OSM）
- 获取当前GPS位置
- 反向地理编码（坐标转地址）
- 拖拽标记调整位置

### 3. 附近搜索
- 基于半径的邻近搜索（5-200公里）
- 支持搜索：
  - 附近的专家
  - 附近的服务请求
  - 附近的设备
- Haversine 公式计算精确距离
- 按距离排序结果

### 4. GPS定位
- 浏览器地理定位API集成
- 实时位置追踪（watchPosition）
- 位置权限处理
- 定位错误处理

---

## 文件结构

```
device-passport-system/
├── apps/
│   ├── api/
│   │   └── src/
│   │       └── modules/
│   │           └── location/
│   │               ├── location.module.ts
│   │               ├── location.controller.ts
│   │               ├── location.service.ts
│   │               └── location.service.spec.ts
│   └── web/
│       └── src/
│           ├── components/
│           │   └── Map/
│           │       ├── MapContainer.tsx
│           │       ├── LocationPicker.tsx
│           │       └── index.ts
│           ├── hooks/
│           │   ├── useGeolocation.ts
│           │   └── useNearbySearch.ts
│           └── pages/
│               └── expert/
│                   └── NearbyExperts.tsx
```

---

## 前端组件

### 1. MapContainer 组件

**位置**: `apps/web/src/components/Map/MapContainer.tsx`

**功能**:
- 显示带标记的交互式地图
- 支持多个标记（设备、专家、服务请求）
- 自定义标记图标和颜色
- 点击标记显示弹出框
- 点击地图返回坐标

**Props**:
```typescript
interface MapContainerProps {
  center: [number, number];           // 地图中心坐标
  zoom?: number;                      // 缩放级别 (默认: 13)
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    type?: 'device' | 'expert' | 'service-request' | 'default';
  }>;
  onMarkerClick?: (id: string) => void;
  onClick?: (lat: number, lng: number) => void;
  height?: string;                    // 默认: '400px'
  className?: string;
}
```

**使用示例**:
```tsx
import { MapContainer } from '../components/Map';

function DeviceMap() {
  const markers = [
    {
      id: '1',
      position: [39.9042, 116.4074],
      title: '设备 #001',
      description: '北京办公室',
      type: 'device'
    }
  ];

  return (
    <MapContainer
      center={[39.9042, 116.4074]}
      zoom={13}
      markers={markers}
      onMarkerClick={(id) => console.log('Clicked:', id)}
      height="500px"
    />
  );
}
```

### 2. LocationPicker 组件

**位置**: `apps/web/src/components/Map/LocationPicker.tsx`

**功能**:
- 让用户选择地理位置
- 地址搜索
- 获取当前GPS位置
- 反向地理编码
- 显示选中的坐标和地址

**Props**:
```typescript
interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
  showAddressSearch?: boolean;
}
```

**使用示例**:
```tsx
import { LocationPicker } from '../components/Map';

function ServiceRequestForm() {
  const [location, setLocation] = useState(null);

  const handleLocationSelect = (lat, lng, address) => {
    setLocation({ lat, lng, address });
  };

  return (
    <LocationPicker
      initialPosition={[39.9042, 116.4074]}
      onLocationSelect={handleLocationSelect}
      height="400px"
      showAddressSearch={true}
    />
  );
}
```

### 3. useGeolocation Hook

**位置**: `apps/web/src/hooks/useGeolocation.ts`

**功能**:
- 获取用户当前位置（一次性）
- 持续监听位置变化

**API**:
```typescript
// 一次性获取位置
const { latitude, longitude, error, loading } = useGeolocation();

// 持续监听位置
const { latitude, longitude, error, loading } = useWatchGeolocation();
```

**使用示例**:
```tsx
import { useGeolocation } from '../hooks/useGeolocation';

function NearbyExperts() {
  const { latitude, longitude, error, loading } = useGeolocation();

  if (loading) return <div>获取位置中...</div>;
  if (error) return <div>错误: {error}</div>;

  return <div>您的位置: {latitude}, {longitude}</div>;
}
```

### 4. useNearbySearch Hook

**位置**: `apps/web/src/hooks/useNearbySearch.ts`

**功能**:
- 查找附近的专家/设备/服务请求
- 计算距离
- 格式化距离显示

**API**:
```typescript
const { data, isLoading, error } = useNearbySearch({
  latitude: 39.9042,
  longitude: 116.4074,
  radius: 50,  // 公里
  type: 'experts' | 'service-requests' | 'devices',
  enabled: true
});

// 辅助函数
calculateDistance(lat1, lon1, lat2, lon2): number
formatDistance(km): string  // "5.2公里" 或 "800米"
```

**使用示例**:
```tsx
import { useNearbySearch, formatDistance } from '../hooks/useNearbySearch';

function NearbyExperts() {
  const { latitude, longitude } = useGeolocation();
  const { data, isLoading } = useNearbySearch({
    latitude,
    longitude,
    radius: 50,
    type: 'experts',
    enabled: !!(latitude && longitude)
  });

  return (
    <div>
      {data?.items.map(expert => (
        <div key={expert.id}>
          {expert.name} - {formatDistance(expert.distance)}
        </div>
      ))}
    </div>
  );
}
```

---

## 后端API

### 1. LocationModule

**位置**: `apps/api/src/modules/location/`

已在 `app.module.ts` 中注册

### 2. API端点

#### GET /api/v1/location/nearby/experts
查找附近的专家

**查询参数**:
- `lat` (必需): 纬度
- `lng` (必需): 经度
- `radius` (可选): 搜索半径（公里，默认50）

**响应**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "张三",
      "distance": 5.2,
      "latitude": 39.9042,
      "longitude": 116.4074,
      "type": "expert",
      "metadata": {
        "expertTypes": ["INSTALLATION"],
        "professionalField": "电气",
        "yearsOfExperience": 10,
        "workStatus": "AVAILABLE",
        "passportCode": "EP-CN-2025-INST-CN-000001-A1"
      }
    }
  ],
  "total": 15,
  "radius": 50,
  "center": { "latitude": 39.9, "longitude": 116.4 }
}
```

#### GET /api/v1/location/nearby/service-requests
查找附近的服务请求

**查询参数**: 同上

**响应**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "设备故障维修",
      "distance": 2.3,
      "latitude": 39.9,
      "longitude": 116.4,
      "type": "service-request",
      "metadata": {
        "serviceType": "REPAIR",
        "urgency": "URGENT",
        "publishedAt": "2026-02-02T10:00:00Z",
        "requiredSkills": ["ELECTRICAL"],
        "budget": 5000
      }
    }
  ],
  "total": 8,
  "radius": 50,
  "center": { "latitude": 39.9, "longitude": 116.4 }
}
```

#### GET /api/v1/location/nearby/devices
查找附近的设备

**查询参数**: 同上

#### GET /api/v1/location/geocode
反向地理编码（坐标转地址）

**查询参数**:
- `lat`: 纬度
- `lng`: 经度

**响应**:
```json
{
  "address": "北京市朝阳区...",
  "city": "北京",
  "state": "北京",
  "country": "中国",
  "countryCode": "CN",
  "postalCode": "100000"
}
```

---

## 页面集成示例

### 1. 附近专家页面

**位置**: `apps/web/src/pages/expert/NearbyExperts.tsx`

**功能**:
- 显示用户附近的所有可用专家
- 地图视图 + 列表视图
- 可调节搜索半径
- 点击专家查看详情

**路由**: `/expert/nearby`

### 2. 专家注册表单集成

在专家注册时，可以使用LocationPicker让专家选择他们的工作位置：

```tsx
import { LocationPicker } from '../../components/Map';

<LocationPicker
  initialPosition={formData.locationLat ? [formData.locationLat, formData.locationLng] : undefined}
  onLocationSelect={(lat, lng, address) => {
    setFormData({
      ...formData,
      locationLat: lat,
      locationLng: lng,
      currentLocation: address
    });
  }}
  height="400px"
  showAddressSearch={true}
/>
```

### 3. 服务请求表单集成

ServiceRequest.tsx 已经有MapPicker，可以替换为新的LocationPicker以获得更好的体验。

---

## 数据库字段

相关实体已经包含位置字段：

### IndividualExpert (专家)
```typescript
@Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
locationLat?: number;

@Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
locationLng?: number;

@Column({ nullable: true })
currentLocation?: string;  // 地址文本
```

### ServiceRequest (服务请求)
```typescript
@Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
locationLat?: number;

@Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
locationLng?: number;
```

### DevicePassport (设备)
通过 `currentLocation` 关系访问位置信息

---

## 性能优化

### 数据库索引
在 `optimize-db.sql` 中已添加位置索引：

```sql
-- Expert location index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_location
  ON individual_expert(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Service request location index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_request_location
  ON service_request(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
```

### 前端优化
- React Query 缓存（5分钟）
- 防抖搜索输入
- 懒加载地图组件

---

## 测试

### 后端测试
**位置**: `apps/api/src/modules/location/location.service.spec.ts`

测试覆盖：
- ✅ 附近专家查找
- ✅ 距离过滤
- ✅ 距离排序
- ✅ Haversine公式准确性
- ✅ 反向地理编码
- ✅ 错误处理

运行测试：
```bash
pnpm test apps/api/src/modules/location
```

---

## 使用的技术栈

| 技术 | 用途 |
|------|------|
| Leaflet.js | 开源地图库 |
| React-Leaflet | React集成 |
| OpenStreetMap | 免费地图瓦片 |
| Nominatim OSM | 地理编码API |
| Haversine Formula | 距离计算 |
| Browser Geolocation API | GPS定位 |

---

## 配置要求

### 前端依赖
已在 `apps/web/package.json` 中：
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.21"
  }
}
```

### 后端依赖
无额外依赖，使用内置 `fetch` API

### 环境变量
无需特殊配置

---

## 限制和注意事项

### 1. Nominatim API 使用政策
- 免费服务有速率限制（1次/秒）
- 生产环境建议使用付费地理编码服务
- 或自建Nominatim实例

### 2. 浏览器兼容性
- 需要支持Geolocation API的现代浏览器
- HTTPS环境下才能获取GPS位置（本地开发除外）

### 3. 距离计算精度
- Haversine公式假设地球是完美球体
- 精度误差约0.5%（对于大多数用例足够）
- 如需更高精度，可使用Vincenty公式

### 4. 性能考虑
- 大量标记（>1000）可能影响地图性能
- 建议使用标记聚类（Marker Clustering）
- 或限制显示的标记数量

---

## 未来增强功能

### Phase 2 (可选)
- [ ] 标记聚类（大量标记时）
- [ ] 热力图显示
- [ ] 路线规划（A到B）
- [ ] 实时位置追踪（专家在途）
- [ ] 地理围栏（Geofencing）
- [ ] 离线地图支持

### Phase 3 (高级)
- [ ] 自定义地图样式
- [ ] 卫星图层切换
- [ ] 交通信息叠加
- [ ] 3D建筑显示
- [ ] AR导航集成

---

## 故障排查

### 问题: 地图不显示
**解决方案**:
1. 检查Leaflet CSS是否正确导入
2. 确保容器有明确的高度
3. 检查浏览器控制台错误

### 问题: 标记图标不显示
**解决方案**:
```typescript
// 确保在MapContainer.tsx中有以下代码
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
```

### 问题: 无法获取GPS位置
**原因**:
- 用户拒绝权限
- 非HTTPS环境
- 浏览器不支持

**解决方案**:
- 提示用户授予权限
- 使用HTTPS部署
- 提供备选方案（手动输入地址）

---

## 示例代码片段

### 在表单中集成LocationPicker

```tsx
import { useForm, Controller } from 'react-hook-form';
import { LocationPicker } from '../components/Map';

interface FormData {
  name: string;
  locationLat?: number;
  locationLng?: number;
  address?: string;
}

function MyForm() {
  const { control, setValue } = useForm<FormData>();

  return (
    <form>
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <LocationPicker
            initialPosition={
              field.value?.lat && field.value?.lng
                ? [field.value.lat, field.value.lng]
                : undefined
            }
            onLocationSelect={(lat, lng, address) => {
              setValue('locationLat', lat);
              setValue('locationLng', lng);
              setValue('address', address);
            }}
          />
        )}
      />
    </form>
  );
}
```

### 显示设备位置

```tsx
import { MapContainer } from '../components/Map';
import { useQuery } from '@tanstack/react-query';

function DeviceDetail({ deviceId }) {
  const { data: device } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => api.get(`/api/v1/passports/${deviceId}`)
  });

  if (!device?.currentLocation) {
    return <div>设备位置未知</div>;
  }

  const markers = [{
    id: device.id,
    position: [
      device.currentLocation.latitude,
      device.currentLocation.longitude
    ],
    title: device.productName,
    description: device.currentLocation.address,
    type: 'device'
  }];

  return (
    <MapContainer
      center={markers[0].position}
      zoom={15}
      markers={markers}
      height="300px"
    />
  );
}
```

---

## 总结

地图功能和GPS定位已完全集成到设备护照系统中，提供：

✅ 交互式地图显示
✅ 位置选择器组件
✅ 附近搜索API
✅ GPS定位支持
✅ 反向地理编码
✅ 完整的测试覆盖
✅ 详细的文档和示例

所有组件都是可复用的，可以轻松集成到任何页面中。

**技术支持**: 查看源代码注释和TypeScript类型定义获取更多细节。

---

**文档版本**: 1.0
**最后更新**: 2026-02-02
**作者**: Claude Code Development Team
