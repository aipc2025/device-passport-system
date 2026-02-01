import { useTranslation } from 'react-i18next';
import { Clock, MessageSquare, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { InquiryStatus, INQUIRY_STATUS_NAMES } from '@device-passport/shared';
import clsx from 'clsx';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function InquiryStatusBadge({ status, size = 'md' }: InquiryStatusBadgeProps) {
  useTranslation(); // Initialize i18n context

  const config: Record<
    InquiryStatus,
    { icon: typeof Clock; bgColor: string; textColor: string }
  > = {
    [InquiryStatus.PENDING]: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    [InquiryStatus.RESPONDED]: {
      icon: MessageSquare,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    [InquiryStatus.NEGOTIATING]: {
      icon: RefreshCw,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    [InquiryStatus.ACCEPTED]: {
      icon: Check,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    [InquiryStatus.REJECTED]: {
      icon: X,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    [InquiryStatus.EXPIRED]: {
      icon: AlertCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        bgColor,
        textColor,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {INQUIRY_STATUS_NAMES[status]}
    </span>
  );
}
