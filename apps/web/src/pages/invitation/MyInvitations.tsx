import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  Link2,
  Copy,
  Check,
  Trash2,
  Plus,
  Gift,
  UserPlus,
  Clock,
  Share2,
  QrCode,
} from 'lucide-react';
import { invitationApi } from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface InvitationCode {
  id: string;
  code: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface InvitationRecord {
  id: string;
  inviteeId: string;
  inviteeName?: string;
  inviteeEmail?: string;
  registerRewardClaimed: boolean;
  firstOrderRewardClaimed: boolean;
  invitedAt: string;
  firstOrderAt: string | null;
}

interface InvitationStats {
  totalInvited: number;
  totalRegistered: number;
  totalFirstOrders: number;
  totalPointsEarned: number;
}

export default function MyInvitations() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCodeSettings, setNewCodeSettings] = useState({
    maxUses: 0,
    expiresInDays: 30,
  });

  const lang = i18n.language.startsWith('zh') ? 'zh' : i18n.language.startsWith('vi') ? 'vi' : 'en';

  // Fetch invitation codes
  const { data: codesData, isLoading: codesLoading } = useQuery({
    queryKey: ['my-invitation-codes'],
    queryFn: () => invitationApi.getMyCodes(),
  });

  // Fetch invitation records
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['my-invitation-records'],
    queryFn: () => invitationApi.getMyRecords(),
  });

  const codes = (codesData as InvitationCode[]) || [];
  const records = recordsData?.records || [];
  const stats = recordsData?.stats as InvitationStats | undefined;

  // Generate code mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      invitationApi.generateCode({
        maxUses: newCodeSettings.maxUses || undefined,
        expiresInDays: newCodeSettings.expiresInDays || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitation-codes'] });
      toast.success(t('invitation.codeGenerated', 'Invitation code generated!'));
      setShowCreateModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('invitation.generateError', 'Failed to generate code'));
    },
  });

  // Deactivate code mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => invitationApi.deactivateCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitation-codes'] });
      toast.success(t('invitation.codeDeactivated', 'Invitation code deactivated'));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('invitation.deactivateError', 'Failed to deactivate code'));
    },
  });

  const copyToClipboard = (code: string) => {
    const inviteUrl = `${window.location.origin}/register?invite=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    toast.success(t('common.copied', 'Copied to clipboard!'));
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <>
      <Helmet>
        <title>My Invitations - Device Passport System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('invitation.title', 'My Invitations')}</h1>
          <p className="text-gray-600">{t('invitation.subtitle', 'Invite friends and earn rewards')}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('invitation.generateCode', 'Generate Code')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalInvited || 0}</p>
          <p className="text-sm text-gray-500">{t('invitation.totalInvited', 'Invited')}</p>
        </div>
        <div className="card p-4 text-center">
          <UserPlus className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalRegistered || 0}</p>
          <p className="text-sm text-gray-500">{t('invitation.registered', 'Registered')}</p>
        </div>
        <div className="card p-4 text-center">
          <Check className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalFirstOrders || 0}</p>
          <p className="text-sm text-gray-500">{t('invitation.firstOrders', 'First Orders')}</p>
        </div>
        <div className="card p-4 text-center">
          <Gift className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalPointsEarned || 0}</p>
          <p className="text-sm text-gray-500">{t('invitation.pointsEarned', 'Points Earned')}</p>
        </div>
      </div>

      {/* My Invitation Codes */}
      <div className="card mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary-500" />
            {t('invitation.myCodes', 'My Invitation Codes')}
          </h2>
        </div>

        {codesLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : codes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{t('invitation.noCodes', 'No invitation codes yet')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('invitation.generateFirst', 'Generate your first code')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {codes.map((code) => {
              const expired = isExpired(code.expiresAt);
              const inactive = !code.isActive || expired;

              return (
                <div
                  key={code.id}
                  className={`p-4 ${inactive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-2 rounded-lg font-mono text-sm ${
                          inactive ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-700'
                        }`}
                      >
                        {code.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {t('invitation.used', 'Used')}: {code.usedCount}
                            {code.maxUses ? ` / ${code.maxUses}` : ''}
                          </span>
                          {expired && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              {t('invitation.expired', 'Expired')}
                            </span>
                          )}
                          {!code.isActive && !expired && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {t('invitation.inactive', 'Inactive')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {t('invitation.created', 'Created')}: {formatDate(code.createdAt)}
                          {code.expiresAt && !expired && (
                            <span className="ml-2">
                              | {t('invitation.expires', 'Expires')}: {formatDate(code.expiresAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!inactive && (
                        <>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            title={t('common.copy', 'Copy')}
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              const inviteUrl = `${window.location.origin}/register?invite=${code.code}`;
                              if (navigator.share) {
                                navigator.share({ title: t('invitation.shareTitle', 'Join me!'), url: inviteUrl });
                              } else {
                                copyToClipboard(code.code);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            title={t('common.share', 'Share')}
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {code.isActive && (
                        <button
                          onClick={() => {
                            if (confirm(t('invitation.confirmDeactivate', 'Are you sure you want to deactivate this code?'))) {
                              deactivateMutation.mutate(code.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title={t('common.deactivate', 'Deactivate')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invitation Records */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-500" />
            {t('invitation.invitedUsers', 'Invited Users')}
          </h2>
        </div>

        {recordsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{t('invitation.noInvites', 'No invites yet')}</p>
            <p className="text-sm mt-1">{t('invitation.shareToStart', 'Share your invitation code to start earning rewards')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((record: InvitationRecord) => (
              <div key={record.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.inviteeName || record.inviteeEmail || t('invitation.anonymousUser', 'User')}</p>
                      <p className="text-sm text-gray-500">
                        {t('invitation.joinedOn', 'Joined')}: {formatDate(record.invitedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.registerRewardClaimed && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {t('invitation.registered', 'Registered')}
                      </span>
                    )}
                    {record.firstOrderRewardClaimed && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        {t('invitation.firstOrder', 'First Order')}
                      </span>
                    )}
                    {!record.firstOrderRewardClaimed && record.registerRewardClaimed && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('invitation.pendingOrder', 'Pending Order')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="card p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('invitation.howItWorks', 'How It Works')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{t('invitation.step1Title', 'Generate Code')}</h3>
            <p className="text-sm text-gray-500">{t('invitation.step1Desc', 'Create your unique invitation code')}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{t('invitation.step2Title', 'Share with Friends')}</h3>
            <p className="text-sm text-gray-500">{t('invitation.step2Desc', 'Send the code or link to your friends')}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{t('invitation.step3Title', 'Earn Rewards')}</h3>
            <p className="text-sm text-gray-500">{t('invitation.step3Desc', 'Get points when they register and make their first order')}</p>
          </div>
        </div>
      </div>

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('invitation.generateNewCode', 'Generate New Invitation Code')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">{t('invitation.maxUses', 'Maximum Uses')} ({t('common.optional', 'Optional')})</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder={t('invitation.unlimitedPlaceholder', '0 = Unlimited')}
                  value={newCodeSettings.maxUses || ''}
                  onChange={(e) => setNewCodeSettings({ ...newCodeSettings, maxUses: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="label">{t('invitation.expiresIn', 'Expires In (Days)')}</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={newCodeSettings.expiresInDays}
                  onChange={(e) => setNewCodeSettings({ ...newCodeSettings, expiresInDays: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="btn-primary flex-1"
              >
                {generateMutation.isPending ? t('common.generating', 'Generating...') : t('common.generate', 'Generate')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
