import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  ChevronRight,
  Gift,
  Shield,
  Info,
} from 'lucide-react';
import { pointsApi } from '../../services/api';
import { PointType, CreditLevel, CREDIT_LEVEL_NAMES } from '@device-passport/shared';
import { useTranslation } from 'react-i18next';

interface PointAccount {
  id: string;
  userId: string;
  rewardPoints: number;
  creditScore: number;
  creditLevel: CreditLevel;
  totalEarnedPoints: number;
  totalSpentPoints: number;
  totalPenaltyPoints: number;
}

interface PointTransaction {
  id: string;
  pointType: PointType;
  actionCode: string;
  actionName: string;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

const creditLevelColors: Record<CreditLevel, { bg: string; text: string; border: string }> = {
  [CreditLevel.BRONZE]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  [CreditLevel.SILVER]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  [CreditLevel.GOLD]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  [CreditLevel.PLATINUM]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  [CreditLevel.DIAMOND]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
};

const creditLevelIcons: Record<CreditLevel, string> = {
  [CreditLevel.BRONZE]: '',
  [CreditLevel.SILVER]: '',
  [CreditLevel.GOLD]: '',
  [CreditLevel.PLATINUM]: '',
  [CreditLevel.DIAMOND]: '',
};

export default function MyPoints() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'reward' | 'penalty'>('all');
  const lang = i18n.language === 'zh' ? 'zh' : 'en';

  // Fetch point account
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['my-point-account'],
    queryFn: () => pointsApi.getMyAccount(),
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['my-point-transactions', activeTab],
    queryFn: () =>
      pointsApi.getMyTransactions({
        limit: 50,
        pointType: activeTab === 'all' ? undefined : activeTab === 'reward' ? PointType.REWARD : PointType.PENALTY,
      }),
  });

  // Fetch rules
  const { data: rules } = useQuery({
    queryKey: ['point-rules'],
    queryFn: () => pointsApi.getRules(),
  });

  const transactions = transactionsData?.transactions || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const pointAccount = account as PointAccount | null;
  const creditLevel = pointAccount?.creditLevel || CreditLevel.BRONZE;
  const levelColors = creditLevelColors[creditLevel];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('points.title', 'My Points')}</h1>
        <p className="text-gray-600">{t('points.subtitle', 'View your points balance, transaction history, and credit level')}</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Reward Points Card */}
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8 text-primary-200" />
            <Gift className="h-6 w-6 text-primary-200" />
          </div>
          <p className="text-primary-100 text-sm mb-1">{t('points.rewardPoints', 'Reward Points')}</p>
          <p className="text-3xl font-bold">{pointAccount?.rewardPoints?.toLocaleString() || 0}</p>
          <p className="text-primary-200 text-xs mt-2">
            {t('points.canRedeem', 'Can be redeemed for services')}
          </p>
        </div>

        {/* Credit Score Card */}
        <div className={`card p-6 ${levelColors.bg} border ${levelColors.border}`}>
          <div className="flex items-center justify-between mb-4">
            <Shield className={`h-8 w-8 ${levelColors.text}`} />
            <span className="text-2xl">{creditLevelIcons[creditLevel]}</span>
          </div>
          <p className={`${levelColors.text} text-sm mb-1`}>{t('points.creditScore', 'Credit Score')}</p>
          <p className={`text-3xl font-bold ${levelColors.text}`}>{pointAccount?.creditScore || 100}</p>
          <div className="flex items-center gap-2 mt-2">
            <Award className={`h-4 w-4 ${levelColors.text}`} />
            <span className={`text-sm font-medium ${levelColors.text}`}>
              {CREDIT_LEVEL_NAMES[creditLevel]?.[lang] || creditLevel}
            </span>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">{t('points.totalEarned', 'Total Earned')}</span>
              <span className="font-semibold text-green-600">
                +{pointAccount?.totalEarnedPoints?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">{t('points.totalSpent', 'Total Spent')}</span>
              <span className="font-semibold text-blue-600">
                -{pointAccount?.totalSpentPoints?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">{t('points.totalPenalty', 'Total Penalty')}</span>
              <span className="font-semibold text-red-600">
                -{pointAccount?.totalPenaltyPoints?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Level Benefits */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('points.creditBenefits', 'Credit Level Benefits')}</h2>
          <Info className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(CreditLevel).map((level) => {
            const colors = creditLevelColors[level];
            const isCurrentLevel = level === creditLevel;
            return (
              <div
                key={level}
                className={`p-3 rounded-lg border-2 ${
                  isCurrentLevel ? `${colors.border} ${colors.bg}` : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{creditLevelIcons[level]}</span>
                  <span className={`text-sm font-medium ${isCurrentLevel ? colors.text : 'text-gray-700'}`}>
                    {CREDIT_LEVEL_NAMES[level]?.[lang]}
                  </span>
                </div>
                {isCurrentLevel && (
                  <span className="text-xs text-primary-600 font-medium">{t('points.currentLevel', 'Current')}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('points.transactionHistory', 'Transaction History')}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('common.all', 'All')}
              </button>
              <button
                onClick={() => setActiveTab('reward')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'reward' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('points.rewards', 'Rewards')}
              </button>
              <button
                onClick={() => setActiveTab('penalty')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'penalty' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('points.penalties', 'Penalties')}
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{t('points.noTransactions', 'No transactions yet')}</p>
            </div>
          ) : (
            transactions.map((tx: PointTransaction) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.points >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {tx.points >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.actionName || tx.actionCode}</p>
                      <p className="text-sm text-gray-500">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.points >= 0 ? '+' : ''}
                      {tx.points}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {transactions.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
              {t('common.viewMore', 'View More')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Point Rules Info */}
      {rules && rules.length > 0 && (
        <div className="card p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('points.howToEarn', 'How to Earn Points')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules
              .filter((r: any) => r.pointType === PointType.REWARD && r.isActive)
              .slice(0, 6)
              .map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{rule.actionName}</span>
                  <span className="text-sm font-semibold text-green-600">+{rule.defaultPoints}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
