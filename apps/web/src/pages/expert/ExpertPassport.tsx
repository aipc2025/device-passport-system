import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  CreditCard,
  QrCode,
  User,
  Star,
  CheckCircle,
  Clock,
  Shield,
  Copy,
  Briefcase,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertApi } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import QRCode from 'qrcode.react';
import { useState } from 'react';

interface PassportData {
  expertCode: string;
  expertCodeGeneratedAt: string;
  parsed: {
    prefix: string;
    type: string;
    yearMonth: string;
    sequence: string;
    checksum: string;
  } | null;
  typeName: string;
  personalName: string;
  professionalField?: string;
  yearsOfExperience?: number;
  avgRating?: number;
  totalReviews: number;
  completedServices: number;
  isAvailable: boolean;
  registrationStatus: string;
}

export default function ExpertPassport() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showQR, setShowQR] = useState(false);

  const { data: passport, isLoading, error } = useQuery<PassportData>({
    queryKey: ['expert-passport', user?.expertId],
    queryFn: () => expertApi.getPassport(user?.expertId as string),
    enabled: !!user?.expertId,
  });

  const copyToClipboard = () => {
    if (passport?.expertCode) {
      navigator.clipboard.writeText(passport.expertCode);
      toast.success(t('expert.codeCopied', 'Passport code copied to clipboard'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Clock className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {t('expert.passportPending', 'Expert Passport Pending')}
          </h2>
          <p className="text-gray-600">
            {t(
              'expert.passportPendingDesc',
              'Your expert passport code will be generated once your registration is approved.'
            )}
          </p>
        </div>
      </div>
    );
  }

  const scanUrl = `${window.location.origin}/scan/expert/${passport.expertCode}`;

  return (
    <>
      <Helmet>
        <title>My Passport - Device Passport System</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          {t('expert.passport', 'Expert Passport')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.passportDesc', 'Your unique digital service passport')}
        </p>
      </div>

      {/* Main Passport Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="p-6 text-white">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-200 text-sm uppercase tracking-wider mb-1">
                {t('expert.digitalPassport', 'Digital Service Passport')}
              </p>
              <h2 className="text-2xl font-bold">{passport.typeName}</h2>
            </div>
            <Shield className="w-10 h-10 text-blue-200" />
          </div>

          {/* Code Display */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs uppercase mb-1">
                  {t('expert.passportCode', 'Passport Code')}
                </p>
                <p className="text-2xl font-mono font-bold tracking-wider">
                  {passport.expertCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={t('common.copy', 'Copy')}
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Code Breakdown */}
          {passport.parsed && (
            <div className="grid grid-cols-5 gap-2 text-center text-xs mb-6">
              <div className="bg-white/10 rounded p-2">
                <p className="text-blue-200">{t('expert.prefix', 'Prefix')}</p>
                <p className="font-mono font-bold">{passport.parsed.prefix}</p>
              </div>
              <div className="bg-white/10 rounded p-2">
                <p className="text-blue-200">{t('expert.type', 'Type')}</p>
                <p className="font-mono font-bold">{passport.parsed.type}</p>
              </div>
              <div className="bg-white/10 rounded p-2">
                <p className="text-blue-200">{t('expert.date', 'Date')}</p>
                <p className="font-mono font-bold">{passport.parsed.yearMonth}</p>
              </div>
              <div className="bg-white/10 rounded p-2">
                <p className="text-blue-200">{t('expert.seq', 'Seq')}</p>
                <p className="font-mono font-bold">{passport.parsed.sequence}</p>
              </div>
              <div className="bg-white/10 rounded p-2">
                <p className="text-blue-200">{t('expert.check', 'Check')}</p>
                <p className="font-mono font-bold">{passport.parsed.checksum}</p>
              </div>
            </div>
          )}

          {/* Expert Info */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{passport.personalName}</h3>
                {passport.professionalField && (
                  <p className="text-blue-200">{passport.professionalField}</p>
                )}
              </div>
              <div
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  passport.isAvailable
                    ? 'bg-green-500/20 text-green-200'
                    : 'bg-red-500/20 text-red-200'
                )}
              >
                {passport.isAvailable
                  ? t('expert.available', 'Available')
                  : t('expert.unavailable', 'Unavailable')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 px-6 py-3 flex justify-between items-center text-sm text-blue-200">
          <span>
            {t('expert.issuedOn', 'Issued')}{' '}
            {new Date(passport.expertCodeGeneratedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {t('expert.verified', 'Verified')}
          </span>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {t('expert.qrCode', 'QR Code')}
          </h3>
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showQR ? t('common.hide', 'Hide') : t('common.show', 'Show')}
          </button>
        </div>
        {showQR && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-inner border">
              <QRCode value={scanUrl} size={200} level="H" />
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              {t('expert.scanToVerify', 'Scan to verify expert credentials')}
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {passport.avgRating?.toFixed(1) || '-'}
          </p>
          <p className="text-sm text-gray-500">{t('expert.rating', 'Rating')}</p>
          <p className="text-xs text-gray-400">
            {passport.totalReviews} {t('expert.reviews', 'reviews')}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{passport.completedServices}</p>
          <p className="text-sm text-gray-500">{t('expert.completedServices', 'Services')}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {passport.yearsOfExperience || 0}
          </p>
          <p className="text-sm text-gray-500">{t('expert.yearsExp', 'Years Exp.')}</p>
        </div>
      </div>

      {/* Verification Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          {t('expert.verificationInfo', 'Verification Information')}
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('expert.identityVerified', 'Identity verified')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('expert.qualificationsVerified', 'Professional qualifications verified')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('expert.backgroundChecked', 'Background check completed')}
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            'expert.verificationNote',
            'This passport code can be scanned by anyone to verify the authenticity of this expert.'
          )}
        </p>
      </div>
      </div>
    </>
  );
}
