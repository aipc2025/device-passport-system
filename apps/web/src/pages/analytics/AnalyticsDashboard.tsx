import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import { LineChart, BarChart, PieChart, AreaChart, StatCard } from '../../components/Charts';
import {
  Activity,
  Package,
  Users,
  Wrench,
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/dashboard/overview').then((r: any) => r.data.data || r.data),
  });

  const { data: passportsByStatus } = useQuery({
    queryKey: ['analytics', 'passports-by-status'],
    queryFn: () => api.get('/analytics/passports/by-status').then((r: any) => r.data.data || r.data),
  });

  const { data: passportsByProductLine } = useQuery({
    queryKey: ['analytics', 'passports-by-product-line'],
    queryFn: () => api.get('/analytics/passports/by-product-line').then((r: any) => r.data.data || r.data),
  });

  const { data: passportsTrend } = useQuery({
    queryKey: ['analytics', 'passports-trend'],
    queryFn: () => api.get('/analytics/passports/trend?days=30').then((r: any) => r.data.data || r.data),
  });

  const { data: serviceOrdersTrend } = useQuery({
    queryKey: ['analytics', 'service-orders-trend'],
    queryFn: () => api.get('/analytics/service-orders/trend?days=30').then((r: any) => r.data.data || r.data),
  });

  const { data: expertStats } = useQuery({
    queryKey: ['analytics', 'expert-statistics'],
    queryFn: () => api.get('/analytics/experts/statistics').then((r: any) => r.data.data || r.data),
  });

  const { data: serviceRequestsByUrgency } = useQuery({
    queryKey: ['analytics', 'service-requests-by-urgency'],
    queryFn: () => api.get('/analytics/service-requests/by-urgency').then((r: any) => r.data.data || r.data),
  });

  return (
    <>
      <Helmet>
        <title>Analytics - Device Passport System</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据分析仪表板</h1>
          <p className="text-gray-600">实时业务数据和关键指标概览</p>
        </div>

        {/* Stat Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="设备总数"
              value={overview.passports.total}
              icon={Package}
              trend={{
                value: parseFloat(overview.passports.inactiveRate),
                isPositive: false,
              }}
              subtitle={`${overview.passports.active} 台在使用`}
              color="blue"
            />
            <StatCard
              title="服务订单"
              value={overview.serviceOrders.total}
              icon={Wrench}
              trend={{
                value: parseFloat(overview.serviceOrders.completionRate),
                isPositive: true,
              }}
              subtitle={`${overview.serviceOrders.pending} 待处理`}
              color="green"
            />
            <StatCard
              title="专家总数"
              value={overview.experts.total}
              icon={Users}
              trend={{
                value: parseFloat(overview.experts.availabilityRate),
                isPositive: true,
              }}
              subtitle={`${overview.experts.available} 可用`}
              color="purple"
            />
            <StatCard
              title="服务请求"
              value={overview.serviceRequests.total}
              icon={Activity}
              subtitle={`${overview.serviceRequests.open} 待接单`}
              color="yellow"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Passports Trend */}
          {passportsTrend && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                设备创建趋势 (30天)
              </h2>
              <LineChart
                data={passportsTrend}
                xKey="date"
                lines={[
                  { dataKey: 'count', name: '新增设备', color: '#3b82f6' },
                ]}
                height={300}
              />
            </div>
          )}

          {/* Service Orders Trend */}
          {serviceOrdersTrend && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                服务订单趋势 (30天)
              </h2>
              <AreaChart
                data={serviceOrdersTrend}
                xKey="date"
                areas={[
                  { dataKey: 'completed', name: '已完成', color: '#10b981' },
                  { dataKey: 'pending', name: '待处理', color: '#f59e0b' },
                ]}
                height={300}
                stacked
              />
            </div>
          )}

          {/* Passports by Status */}
          {passportsByStatus && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                设备状态分布
              </h2>
              <PieChart
                data={passportsByStatus}
                height={300}
                innerRadius={60}
              />
            </div>
          )}

          {/* Passports by Product Line */}
          {passportsByProductLine && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                产品线分布
              </h2>
              <BarChart
                data={passportsByProductLine}
                xKey="name"
                bars={[
                  { dataKey: 'value', name: '数量', color: '#8b5cf6' },
                ]}
                height={300}
              />
            </div>
          )}

          {/* Expert Types */}
          {expertStats?.byType && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                专家类型分布
              </h2>
              <BarChart
                data={expertStats.byType}
                xKey="name"
                bars={[
                  { dataKey: 'value', name: '专家数', color: '#10b981' },
                ]}
                height={300}
                horizontal
              />
            </div>
          )}

          {/* Service Requests by Urgency */}
          {serviceRequestsByUrgency && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                服务请求紧急程度
              </h2>
              <PieChart
                data={serviceRequestsByUrgency}
                height={300}
                colors={['#ef4444', '#f59e0b', '#10b981']}
              />
            </div>
          )}
        </div>

        {/* Expert Statistics */}
        {expertStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              专家统计
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{expertStats.total}</p>
                <p className="text-sm text-gray-600 mt-1">总专家数</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{expertStats.approved}</p>
                <p className="text-sm text-gray-600 mt-1">已认证</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{expertStats.pending}</p>
                <p className="text-sm text-gray-600 mt-1">待审核</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{expertStats.available}</p>
                <p className="text-sm text-gray-600 mt-1">当前可用</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
