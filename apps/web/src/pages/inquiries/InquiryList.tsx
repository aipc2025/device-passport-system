import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Loader2 } from 'lucide-react';
import { inquiryApi } from '../../services/api';
import { InquiryCard } from '../../components/inquiry';
import { useInquiryStore } from '../../store/inquiry.store';
import clsx from 'clsx';

export default function InquiryList() {
  const { t } = useTranslation();
  const { activeView, setActiveView } = useInquiryStore();

  const { data: allInquiries, isLoading: loadingAll } = useQuery({
    queryKey: ['inquiries-all'],
    queryFn: () => inquiryApi.getAll(),
    enabled: activeView === 'all',
  });

  const { data: sentInquiries, isLoading: loadingSent } = useQuery({
    queryKey: ['inquiries-sent'],
    queryFn: () => inquiryApi.getSent(),
    enabled: activeView === 'sent',
  });

  const { data: receivedInquiries, isLoading: loadingReceived } = useQuery({
    queryKey: ['inquiries-received'],
    queryFn: () => inquiryApi.getReceived(),
    enabled: activeView === 'received',
  });

  const isLoading = loadingAll || loadingSent || loadingReceived;
  const inquiries =
    activeView === 'all'
      ? allInquiries
      : activeView === 'sent'
      ? sentInquiries
      : receivedInquiries;

  const tabs = [
    { id: 'all' as const, label: t('inquiry.all', 'All') },
    { id: 'sent' as const, label: t('inquiry.sent', 'Sent') },
    { id: 'received' as const, label: t('inquiry.received', 'Received') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('inquiry.inquiries', 'Inquiries')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('inquiry.manageInquiries', 'Manage your conversations with buyers and suppliers')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeView === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Inquiry list */}
      {!isLoading && inquiries && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry: any) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              role={activeView === 'received' ? 'supplier' : 'buyer'}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!inquiries || inquiries.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {activeView === 'sent'
              ? t('inquiry.noSent', "You haven't sent any inquiries yet")
              : activeView === 'received'
              ? t('inquiry.noReceived', "You haven't received any inquiries yet")
              : t('inquiry.noInquiries', 'No inquiries yet')}
          </p>
        </div>
      )}
    </div>
  );
}
