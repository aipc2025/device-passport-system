import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Check, X, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InquiryStatus, INQUIRY_STATUS_NAMES } from '@device-passport/shared';
import clsx from 'clsx';

interface InquiryCardProps {
  inquiry: {
    id: string;
    inquiryCode: string;
    subject: string;
    status: InquiryStatus;
    quantity?: number;
    targetPrice?: number;
    targetCurrency?: string;
    createdAt: string;
    respondedAt?: string;
    buyerOrg?: { name: string };
    supplierOrg?: { name: string };
    marketplaceProduct?: { listingTitle: string };
    buyerRequirement?: { title: string };
  };
  role: 'buyer' | 'supplier';
}

export default function InquiryCard({ inquiry, role }: InquiryCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case InquiryStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case InquiryStatus.RESPONDED:
        return 'bg-blue-100 text-blue-800';
      case InquiryStatus.NEGOTIATING:
        return 'bg-purple-100 text-purple-800';
      case InquiryStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case InquiryStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case InquiryStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case InquiryStatus.PENDING:
        return <Clock className="w-3 h-3" />;
      case InquiryStatus.RESPONDED:
      case InquiryStatus.NEGOTIATING:
        return <MessageSquare className="w-3 h-3" />;
      case InquiryStatus.ACCEPTED:
        return <Check className="w-3 h-3" />;
      case InquiryStatus.REJECTED:
      case InquiryStatus.EXPIRED:
        return <X className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const counterparty = role === 'buyer' ? inquiry.supplierOrg : inquiry.buyerOrg;
  const relatedItem = inquiry.marketplaceProduct || inquiry.buyerRequirement;

  return (
    <Link
      to={`/inquiries/${inquiry.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-gray-500 font-mono">{inquiry.inquiryCode}</span>
          <h3 className="font-medium text-gray-900 line-clamp-1">{inquiry.subject}</h3>
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(inquiry.status)
          )}
        >
          {getStatusIcon(inquiry.status)}
          {INQUIRY_STATUS_NAMES[inquiry.status]}
        </span>
      </div>

      {counterparty && (
        <p className="text-sm text-gray-600 mb-2">
          {role === 'buyer' ? t('inquiry.to', 'To') : t('inquiry.from', 'From')}:{' '}
          <span className="font-medium">{counterparty.name}</span>
        </p>
      )}

      {relatedItem && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {inquiry.marketplaceProduct
            ? t('inquiry.regarding', 'Regarding')
            : t('inquiry.forRfq', 'For RFQ')}:{' '}
          {'listingTitle' in relatedItem ? relatedItem.listingTitle : relatedItem.title}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {inquiry.quantity && (
            <span>
              {t('inquiry.qty', 'Qty')}: {inquiry.quantity}
            </span>
          )}
          {inquiry.targetPrice && (
            <span>
              {t('inquiry.target', 'Target')}: {inquiry.targetCurrency || 'USD'}{' '}
              {inquiry.targetPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-blue-600 font-medium">
          {t('inquiry.viewDetails', 'View')}
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {new Date(inquiry.createdAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
