import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Search,
  User,
  Star,
  CheckCircle,
  Clock,
  Filter,
  Plus,
} from 'lucide-react';
import { adminExpertApi } from '../../services/api';
import {
  RegistrationStatus,
  REGISTRATION_STATUS_NAMES,
  ExpertType,
} from '@device-passport/shared';

const EXPERT_TYPE_NAMES: Record<ExpertType, string> = {
  [ExpertType.TECHNICAL]: 'Technical',
  [ExpertType.BUSINESS]: 'Business',
};
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ExpertPassportList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [passportFilter, setPassportFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experts', search, statusFilter, passportFilter],
    queryFn: () =>
      adminExpertApi.getAllExperts({
        search: search || undefined,
        status: statusFilter || undefined,
        hasPassport:
          passportFilter === 'yes' ? true : passportFilter === 'no' ? false : undefined,
        limit: 100,
      }),
  });

  const generatePassportMutation = useMutation({
    mutationFn: (expertId: string) => adminExpertApi.generatePassportCode(expertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] });
      toast.success(t('admin.passportGenerated', 'Expert passport code generated'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate passport code');
    },
  });

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case RegistrationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RegistrationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          {t('admin.expertPassports', 'Expert Passports')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('admin.expertPassportsDesc', 'Manage expert passport codes')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.searchExperts', 'Search by name, email, or passport code...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('admin.allStatus', 'All Status')}</option>
              <option value={RegistrationStatus.APPROVED}>{REGISTRATION_STATUS_NAMES[RegistrationStatus.APPROVED]}</option>
              <option value={RegistrationStatus.PENDING}>{REGISTRATION_STATUS_NAMES[RegistrationStatus.PENDING]}</option>
              <option value={RegistrationStatus.REJECTED}>{REGISTRATION_STATUS_NAMES[RegistrationStatus.REJECTED]}</option>
            </select>
          </div>

          {/* Passport Filter */}
          <div>
            <select
              value={passportFilter}
              onChange={(e) => setPassportFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('admin.allPassports', 'All Passports')}</option>
              <option value="yes">{t('admin.hasPassport', 'Has Passport')}</option>
              <option value="no">{t('admin.noPassport', 'No Passport')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{t('admin.totalExperts', 'Total Experts')}</p>
            <p className="text-2xl font-bold text-gray-900">{data.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{t('admin.withPassport', 'With Passport')}</p>
            <p className="text-2xl font-bold text-green-600">
              {data.experts?.filter((e: any) => e.expertCode).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{t('admin.pendingPassport', 'Pending Passport')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {data.experts?.filter((e: any) => !e.expertCode && e.registrationStatus === RegistrationStatus.APPROVED).length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Experts Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : data?.experts?.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.expert', 'Expert')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.passportCode', 'Passport Code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.type', 'Type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.status', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.rating', 'Rating')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.experts.map((expert: any) => (
                <tr key={expert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expert.personalName}
                        </p>
                        <p className="text-xs text-gray-500">{expert.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {expert.expertCode ? (
                      <div>
                        <p className="text-sm font-mono font-medium text-gray-900">
                          {expert.expertCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('admin.generatedOn', 'Generated')}{' '}
                          {new Date(expert.expertCodeGeneratedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t('admin.notGenerated', 'Not generated')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.expertTypes?.map((type: ExpertType) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                        >
                          {EXPERT_TYPE_NAMES[type]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(expert.registrationStatus)
                      )}
                    >
                      {REGISTRATION_STATUS_NAMES[expert.registrationStatus as RegistrationStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {expert.avgRating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{expert.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">
                          ({expert.totalReviews})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!expert.expertCode && expert.registrationStatus === RegistrationStatus.APPROVED ? (
                      <button
                        onClick={() => generatePassportMutation.mutate(expert.id)}
                        disabled={generatePassportMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        {t('admin.generatePassport', 'Generate')}
                      </button>
                    ) : expert.expertCode ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {t('admin.issued', 'Issued')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {t('admin.pendingApproval', 'Pending approval')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('admin.noExperts', 'No experts found')}</p>
        </div>
      )}
    </div>
  );
}
