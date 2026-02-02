import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  Search,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Gift,
  Settings,
  Save,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { PointType } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface PointRule {
  id: string;
  actionCode: string;
  actionName: string;
  description: string;
  category: string;
  pointType: PointType;
  defaultPoints: number;
  minPoints?: number;
  maxPoints?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  totalLimit?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const POINT_TYPE_CONFIG: Record<PointType, { color: string; icon: any }> = {
  [PointType.REWARD]: { color: 'bg-green-100 text-green-800', icon: Gift },
  [PointType.CREDIT]: { color: 'bg-blue-100 text-blue-800', icon: Award },
  [PointType.PENALTY]: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

// API functions
const pointRuleApi = {
  getAll: async (): Promise<{ data: PointRule[] }> => {
    const response = await api.get('/admin/point-rules');
    return response.data;
  },
  getStatistics: async (): Promise<{
    data: {
      totalPointsIssued: number;
      totalPointsConsumed: number;
      totalPenaltyPoints: number;
      netCirculation: number;
      byAction: { actionCode: string; actionName: string; count: number; totalPoints: number }[];
    };
  }> => {
    const response = await api.get('/admin/point-rules/statistics');
    return response.data;
  },
  create: async (data: Partial<PointRule>): Promise<{ data: PointRule }> => {
    const response = await api.post('/admin/point-rules', data);
    return response.data;
  },
  update: async (id: string, data: Partial<PointRule>): Promise<{ data: PointRule }> => {
    const response = await api.patch(`/admin/point-rules/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/point-rules/${id}`);
  },
  seed: async (): Promise<void> => {
    await api.post('/admin/point-rules/seed');
  },
};

export default function PointRuleList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [editingRule, setEditingRule] = useState<PointRule | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);

  // Translated labels
  const getCategoryLabel = (category: string) => t(`pointCategory.${category}`, category);
  const getTypeLabel = (type: PointType) => t(`pointType.${type}`, type);

  // Fetch rules
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['admin-point-rules'],
    queryFn: pointRuleApi.getAll,
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-point-statistics'],
    queryFn: pointRuleApi.getStatistics,
    enabled: showStatistics,
  });

  const rules = rulesData?.data || [];

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !rule.actionCode.toLowerCase().includes(searchLower) &&
        !rule.actionName.toLowerCase().includes(searchLower) &&
        !(rule.description || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (categoryFilter && rule.category !== categoryFilter) {
      return false;
    }
    if (typeFilter && rule.pointType !== typeFilter) {
      return false;
    }
    return true;
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PointRule> }) =>
      pointRuleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-rules'] });
      toast.success(t('pointRules.ruleUpdated'));
      setEditingRule(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('pointRules.updateFailed'));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      pointRuleApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-rules'] });
      toast.success(t('pointRules.ruleUpdated'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('pointRules.updateFailed'));
    },
  });

  const seedMutation = useMutation({
    mutationFn: pointRuleApi.seed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-rules'] });
      toast.success(t('pointRules.seeded'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('pointRules.seedFailed'));
    },
  });

  // Get unique categories
  const categories = Array.from(new Set(rules.map((r) => r.category))).sort();

  // Statistics summary
  const rewardRules = filteredRules.filter((r) => r.pointType === PointType.REWARD);
  const penaltyRules = filteredRules.filter((r) => r.pointType === PointType.PENALTY);
  const activeRules = filteredRules.filter((r) => r.isActive);

  return (
    <>
      <Helmet>
        <title>Point Rules - Device Passport System</title>
      </Helmet>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {t('pointRules.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('pointRules.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2',
              showStatistics
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            <BarChart2 className="h-4 w-4" />
            {t('pointRules.statistics')}
          </button>
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className={clsx('h-4 w-4', seedMutation.isPending && 'animate-spin')} />
            {t('pointRules.seedDefaults')}
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStatistics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('pointRules.statistics')}</h3>
          {statsLoading ? (
            <div className="text-center py-4 text-gray-500">{t('common.loading')}</div>
          ) : statsData?.data ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">{t('pointRules.totalIssued')}</div>
                <div className="text-2xl font-bold text-green-700">
                  {statsData.data.totalPointsIssued.toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">{t('pointRules.totalConsumed')}</div>
                <div className="text-2xl font-bold text-blue-700">
                  {statsData.data.totalPointsConsumed.toLocaleString()}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600">{t('pointRules.totalPenalty')}</div>
                <div className="text-2xl font-bold text-red-700">
                  {statsData.data.totalPenaltyPoints.toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600">{t('pointRules.netCirculation')}</div>
                <div className="text-2xl font-bold text-purple-700">
                  {statsData.data.netCirculation.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">{t('common.noResults')}</div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('pointRules.totalRules')}</div>
              <div className="text-xl font-semibold">{rules.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('pointRules.rewardRules')}</div>
              <div className="text-xl font-semibold">{rewardRules.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('pointRules.penaltyRules')}</div>
              <div className="text-xl font-semibold">{penaltyRules.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('pointRules.activeRules')}</div>
              <div className="text-xl font-semibold">{activeRules.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('pointRules.searchRules')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('pointRules.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('pointRules.allTypes')}</option>
              <option value={PointType.REWARD}>{t('pointType.REWARD')}</option>
              <option value={PointType.CREDIT}>{t('pointType.CREDIT')}</option>
              <option value={PointType.PENALTY}>{t('pointType.PENALTY')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : filteredRules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>{t('pointRules.noRules')}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.action')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.category')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.type')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.points')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.limits')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pointRules.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => {
                const typeConfig = POINT_TYPE_CONFIG[rule.pointType];
                const TypeIcon = typeConfig.icon;

                return (
                  <tr key={rule.id} className={clsx(!rule.isActive && 'opacity-50')}>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{rule.actionName}</div>
                        <div className="text-xs text-gray-500 font-mono">{rule.actionCode}</div>
                        {rule.description && (
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                            {rule.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {getCategoryLabel(rule.category)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={clsx(
                          'px-2 py-1 text-xs rounded-full inline-flex items-center gap-1',
                          typeConfig.color
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {getTypeLabel(rule.pointType)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingRule?.id === rule.id ? (
                        <input
                          type="number"
                          value={editingRule.defaultPoints}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              defaultPoints: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                      ) : (
                        <span
                          className={clsx(
                            'font-medium',
                            rule.defaultPoints > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {rule.defaultPoints > 0 ? '+' : ''}
                          {rule.defaultPoints}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-gray-500">
                      {rule.dailyLimit && <div>{t('pointRules.daily')}: {rule.dailyLimit}</div>}
                      {rule.weeklyLimit && <div>{t('pointRules.weekly')}: {rule.weeklyLimit}</div>}
                      {rule.monthlyLimit && <div>{t('pointRules.monthly')}: {rule.monthlyLimit}</div>}
                      {rule.totalLimit && <div>{t('pointRules.total')}: {rule.totalLimit}</div>}
                      {!rule.dailyLimit &&
                        !rule.weeklyLimit &&
                        !rule.monthlyLimit &&
                        !rule.totalLimit && <div className="text-gray-400">{t('pointRules.noLimit')}</div>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: rule.id, isActive: !rule.isActive })
                        }
                        className={clsx(
                          'px-2 py-1 text-xs rounded-full font-medium',
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {rule.isActive ? t('pointRules.active') : t('pointRules.inactive')}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {editingRule?.id === rule.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: rule.id,
                                data: { defaultPoints: editingRule.defaultPoints },
                              })
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingRule(null)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </>
  );
}
