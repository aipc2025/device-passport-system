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
  Zap,
  Coffee,
  Calendar,
  Wrench,
  Moon,
  Award,
  X,
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { adminExpertApi, ratingApi } from '../../services/api';
import {
  RegistrationStatus,
  REGISTRATION_STATUS_NAMES,
  ExpertType,
  ExpertWorkStatus,
  ExpertMembershipLevel,
  CreditLevel,
} from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const EXPERT_TYPE_CONFIG: Record<ExpertType, { name: string; color: string }> = {
  [ExpertType.TECHNICAL]: { name: 'Technical', color: 'bg-blue-50 text-blue-700' },
  [ExpertType.BUSINESS]: { name: 'Business', color: 'bg-green-50 text-green-700' },
};

const WORK_STATUS_CONFIG: Record<ExpertWorkStatus, { label: string; color: string; icon: any }> = {
  [ExpertWorkStatus.RUSHING]: { label: 'Rushing', color: 'bg-orange-100 text-orange-800', icon: Zap },
  [ExpertWorkStatus.IDLE]: { label: 'Idle', color: 'bg-green-100 text-green-800', icon: Coffee },
  [ExpertWorkStatus.BOOKED]: { label: 'Booked', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  [ExpertWorkStatus.IN_SERVICE]: { label: 'In Service', color: 'bg-purple-100 text-purple-800', icon: Wrench },
  [ExpertWorkStatus.OFF_DUTY]: { label: 'Off Duty', color: 'bg-gray-100 text-gray-800', icon: Moon },
};

const MEMBERSHIP_CONFIG: Record<ExpertMembershipLevel, { label: string; color: string }> = {
  [ExpertMembershipLevel.STANDARD]: { label: 'Standard', color: 'text-gray-500' },
  [ExpertMembershipLevel.SILVER]: { label: 'Silver', color: 'text-gray-400' },
  [ExpertMembershipLevel.GOLD]: { label: 'Gold', color: 'text-yellow-500' },
  [ExpertMembershipLevel.DIAMOND]: { label: 'Diamond', color: 'text-blue-500' },
};

const CREDIT_CONFIG: Record<CreditLevel, { label: string; color: string }> = {
  [CreditLevel.BRONZE]: { label: 'Bronze', color: 'text-amber-700' },
  [CreditLevel.SILVER]: { label: 'Silver', color: 'text-gray-400' },
  [CreditLevel.GOLD]: { label: 'Gold', color: 'text-yellow-500' },
  [CreditLevel.PLATINUM]: { label: 'Platinum', color: 'text-cyan-500' },
  [CreditLevel.DIAMOND]: { label: 'Diamond', color: 'text-blue-500' },
};

interface ExpertDetail {
  id: string;
  personalName: string;
  email: string;
  phone?: string;
  expertCode?: string;
  expertCodeGeneratedAt?: string;
  expertTypes: ExpertType[];
  professionalField?: string;
  yearsOfExperience?: number;
  servicesOffered?: string;
  certifications?: string[];
  currentLocation?: string;
  bio?: string;
  isAvailable?: boolean;
  avgRating?: number;
  totalReviews?: number;
  workStatus: ExpertWorkStatus;
  membershipLevel: ExpertMembershipLevel;
  creditLevel: CreditLevel;
  creditScore?: number;
  rewardPoints?: number;
  registrationStatus: RegistrationStatus;
}

export default function ExpertPassportList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'zh' ? 'zh' : 'en';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [passportFilter, setPassportFilter] = useState<string>('');
  const [workStatusFilter, setWorkStatusFilter] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<ExpertDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experts', search, statusFilter, passportFilter, workStatusFilter],
    queryFn: () =>
      adminExpertApi.getAllExperts({
        search: search || undefined,
        status: statusFilter || undefined,
        hasPassport:
          passportFilter === 'yes' ? true : passportFilter === 'no' ? false : undefined,
        limit: 100,
      }),
  });

  // Filter by work status client-side (TODO: add to backend)
  const filteredExperts = data?.experts?.filter((expert: any) => {
    if (workStatusFilter && expert.workStatus !== workStatusFilter) {
      return false;
    }
    return true;
  }) || [];

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

  // Count by work status
  const workStatusCounts = {
    [ExpertWorkStatus.RUSHING]: filteredExperts.filter((e: any) => e.workStatus === ExpertWorkStatus.RUSHING).length,
    [ExpertWorkStatus.IDLE]: filteredExperts.filter((e: any) => e.workStatus === ExpertWorkStatus.IDLE).length,
    [ExpertWorkStatus.BOOKED]: filteredExperts.filter((e: any) => e.workStatus === ExpertWorkStatus.BOOKED).length,
    [ExpertWorkStatus.IN_SERVICE]: filteredExperts.filter((e: any) => e.workStatus === ExpertWorkStatus.IN_SERVICE).length,
    [ExpertWorkStatus.OFF_DUTY]: filteredExperts.filter((e: any) => e.workStatus === ExpertWorkStatus.OFF_DUTY).length,
  };

  // Fetch service records for selected expert
  const { data: serviceRecords } = useQuery({
    queryKey: ['expert-service-records', selectedExpert?.id],
    queryFn: () => ratingApi.getExpertServiceRecords(selectedExpert!.id, undefined, 20),
    enabled: !!selectedExpert?.id,
  });

  const handleSelectExpert = (expert: any) => {
    setSelectedExpert(expert);
  };

  const closeDetail = () => {
    setSelectedExpert(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          {t('admin.expertPassportsDesc', 'Manage expert passport codes and work status')}
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

          {/* Registration Status Filter */}
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

          {/* Work Status Filter */}
          <div>
            <select
              value={workStatusFilter}
              onChange={(e) => setWorkStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Work Status</option>
              {Object.entries(WORK_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
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
          {/* Work Status Stats */}
          <div className="bg-white rounded-lg border border-orange-200 p-4">
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <Zap className="w-4 h-4" /> Rushing
            </p>
            <p className="text-2xl font-bold text-orange-600">{workStatusCounts[ExpertWorkStatus.RUSHING]}</p>
          </div>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Coffee className="w-4 h-4" /> Idle
            </p>
            <p className="text-2xl font-bold text-green-600">{workStatusCounts[ExpertWorkStatus.IDLE]}</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-4">
            <p className="text-sm text-purple-600 flex items-center gap-1">
              <Wrench className="w-4 h-4" /> In Service
            </p>
            <p className="text-2xl font-bold text-purple-600">{workStatusCounts[ExpertWorkStatus.IN_SERVICE]}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Moon className="w-4 h-4" /> Off Duty
            </p>
            <p className="text-2xl font-bold text-gray-500">{workStatusCounts[ExpertWorkStatus.OFF_DUTY]}</p>
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
      ) : filteredExperts.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.expert', 'Expert')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.passportCode', 'Passport Code')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.rating', 'Rating')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExperts.map((expert: any) => {
                const workStatus = WORK_STATUS_CONFIG[expert.workStatus as ExpertWorkStatus] || WORK_STATUS_CONFIG[ExpertWorkStatus.IDLE];
                const WorkStatusIcon = workStatus.icon;
                const membership = MEMBERSHIP_CONFIG[expert.membershipLevel as ExpertMembershipLevel] || MEMBERSHIP_CONFIG[ExpertMembershipLevel.STANDARD];
                const credit = CREDIT_CONFIG[expert.creditLevel as CreditLevel] || CREDIT_CONFIG[CreditLevel.BRONZE];

                return (
                  <tr
                    key={expert.id}
                    className={clsx(
                      'hover:bg-gray-50 cursor-pointer transition-colors',
                      selectedExpert?.id === expert.id && 'bg-blue-50'
                    )}
                    onClick={() => handleSelectExpert(expert)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {expert.personalName}
                          </p>
                          <p className="text-xs text-gray-500">{expert.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {expert.expertTypes?.map((type: ExpertType) => {
                              const config = EXPERT_TYPE_CONFIG[type];
                              return (
                                <span
                                  key={type}
                                  className={`px-1.5 py-0.5 text-xs rounded ${config?.color || 'bg-gray-50 text-gray-700'}`}
                                >
                                  {config?.name || type}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {expert.expertCode ? (
                        <div>
                          <p className="text-sm font-mono font-medium text-gray-900">
                            {expert.expertCode}
                          </p>
                          <p className="text-xs text-gray-500">
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
                    <td className="px-4 py-4">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full', workStatus.color)}>
                        <WorkStatusIcon className="w-3 h-3" />
                        {workStatus.label}
                      </span>
                      {expert.activeServiceCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {expert.activeServiceCount} active
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={clsx('flex items-center gap-1 text-sm font-medium', membership.color)}>
                        <Award className="w-4 h-4" />
                        {membership.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className={clsx('text-sm font-medium', credit.color)}>
                          {credit.label}
                        </span>
                        <p className="text-xs text-gray-500">
                          {expert.creditScore || 0} pts
                        </p>
                        <p className="text-xs text-gray-400">
                          {expert.rewardPoints || 0} rewards
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {expert.avgRating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{Number(expert.avgRating).toFixed(1)}</span>
                          <span className="text-xs text-gray-500">
                            ({expert.totalReviews})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {!expert.expertCode && expert.registrationStatus === RegistrationStatus.APPROVED ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePassportMutation.mutate(expert.id);
                          }}
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
                          {REGISTRATION_STATUS_NAMES[expert.registrationStatus as RegistrationStatus]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('admin.noExperts', 'No experts found')}</p>
        </div>
      )}

      {/* Expert Detail Panel */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetail} />
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('admin.expertDetails', 'Expert Details')}
                </h2>
                <p className="text-sm text-gray-500">{selectedExpert.personalName}</p>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Passport Code Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    {t('admin.digitalPassport', 'Digital Service Passport')}
                  </span>
                </div>
                {selectedExpert.expertCode ? (
                  <>
                    <p className="text-2xl font-mono font-bold tracking-wider mb-2">
                      {selectedExpert.expertCode}
                    </p>
                    <p className="text-sm opacity-75">
                      {t('admin.issuedOn', 'Issued on')}: {formatDate(selectedExpert.expertCodeGeneratedAt)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg opacity-75">
                    {t('admin.passportNotGenerated', 'Passport not yet generated')}
                  </p>
                )}
              </div>

              {/* Expert Types */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t('admin.expertTypes', 'Expert Types')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.expertTypes?.map((type: ExpertType) => {
                    const config = EXPERT_TYPE_CONFIG[type];
                    return (
                      <span
                        key={type}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full ${config?.color || 'bg-gray-50 text-gray-700'}`}
                      >
                        {config?.name || type}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Current Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">{t('admin.workStatus', 'Work Status')}</p>
                  {(() => {
                    const ws = WORK_STATUS_CONFIG[selectedExpert.workStatus as ExpertWorkStatus] || WORK_STATUS_CONFIG[ExpertWorkStatus.IDLE];
                    const Icon = ws.icon;
                    return (
                      <span className={clsx('inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full', ws.color)}>
                        <Icon className="w-4 h-4" />
                        {ws.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">{t('admin.availability', 'Availability')}</p>
                  <span className={clsx(
                    'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full',
                    selectedExpert.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  )}>
                    {selectedExpert.isAvailable ? t('admin.available', 'Available') : t('admin.unavailable', 'Unavailable')}
                  </span>
                </div>
              </div>

              {/* Public Profile / Resume */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('admin.publicProfile', 'Public Profile')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedExpert.professionalField && (
                    <div>
                      <p className="text-xs text-gray-500">{t('admin.professionalField', 'Professional Field')}</p>
                      <p className="text-sm text-gray-900">{selectedExpert.professionalField}</p>
                    </div>
                  )}
                  {selectedExpert.yearsOfExperience && (
                    <div>
                      <p className="text-xs text-gray-500">{t('admin.experience', 'Experience')}</p>
                      <p className="text-sm text-gray-900">{selectedExpert.yearsOfExperience} {t('admin.years', 'years')}</p>
                    </div>
                  )}
                  {selectedExpert.servicesOffered && (
                    <div>
                      <p className="text-xs text-gray-500">{t('admin.servicesOffered', 'Services Offered')}</p>
                      <p className="text-sm text-gray-900">{selectedExpert.servicesOffered}</p>
                    </div>
                  )}
                  {selectedExpert.bio && (
                    <div>
                      <p className="text-xs text-gray-500">{t('admin.bio', 'Bio')}</p>
                      <p className="text-sm text-gray-900">{selectedExpert.bio}</p>
                    </div>
                  )}
                  {selectedExpert.certifications && selectedExpert.certifications.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('admin.certifications', 'Certifications')}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedExpert.certifications.map((cert, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedExpert.currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {selectedExpert.currentLocation}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {t('admin.contactInfo', 'Contact Information')}
                </h3>
                <div className="space-y-2">
                  {selectedExpert.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedExpert.email}</span>
                    </div>
                  )}
                  {selectedExpert.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedExpert.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating & Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold text-gray-900">
                      {selectedExpert.avgRating ? Number(selectedExpert.avgRating).toFixed(1) : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedExpert.totalReviews || 0} {t('admin.reviews', 'reviews')}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedExpert.creditScore || 0}</p>
                  <p className="text-xs text-gray-500">{t('admin.creditScore', 'Credit Score')}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedExpert.rewardPoints || 0}</p>
                  <p className="text-xs text-gray-500">{t('admin.rewardPoints', 'Reward Points')}</p>
                </div>
              </div>

              {/* Membership */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{t('admin.membershipLevel', 'Membership Level')}</p>
                    {(() => {
                      const m = MEMBERSHIP_CONFIG[selectedExpert.membershipLevel as ExpertMembershipLevel] || MEMBERSHIP_CONFIG[ExpertMembershipLevel.STANDARD];
                      return (
                        <span className={clsx('flex items-center gap-2 text-lg font-semibold', m.color)}>
                          <Award className="w-5 h-5" />
                          {m.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('admin.creditLevel', 'Credit Level')}</p>
                    {(() => {
                      const c = CREDIT_CONFIG[selectedExpert.creditLevel as CreditLevel] || CREDIT_CONFIG[CreditLevel.BRONZE];
                      return (
                        <span className={clsx('text-lg font-semibold', c.color)}>
                          {c.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Service Records */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  {t('admin.serviceRecords', 'Platform Service Records')}
                </h3>
                {serviceRecords && serviceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {serviceRecords.map((record: any) => (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {record.serviceRequest?.title || t('admin.serviceOrder', 'Service Order')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.serviceRequest?.serviceType || '-'}
                            </p>
                          </div>
                          <span className={clsx(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            record.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            record.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {record.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(record.createdAt)}</span>
                          <span>{record.priceCurrency} {record.agreedPrice?.toLocaleString()}</span>
                          {record.review && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {record.review.overallRating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {t('admin.noServiceRecords', 'No service records yet')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
