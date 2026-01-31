import { useTranslation } from 'react-i18next';
import { User, DollarSign, Clock } from 'lucide-react';
import { InquiryMessageType, INQUIRY_MESSAGE_TYPE_NAMES } from '@device-passport/shared';
import clsx from 'clsx';

interface Message {
  id: string;
  messageType: InquiryMessageType;
  content?: string;
  quotePrice?: number;
  quoteCurrency?: string;
  quoteValidUntil?: string;
  quotedLeadTimeDays?: number;
  senderUser?: { name: string };
  senderOrgId: string;
  isRead: boolean;
  createdAt: string;
}

interface MessageThreadProps {
  messages: Message[];
  currentOrgId: string;
}

export default function MessageThread({ messages, currentOrgId }: MessageThreadProps) {
  const { t } = useTranslation();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const renderQuoteDetails = (message: Message) => {
    if (!message.quotePrice) return null;

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <DollarSign className="w-4 h-4" />
          {message.quoteCurrency || 'USD'} {message.quotePrice.toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          {message.quotedLeadTimeDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {message.quotedLeadTimeDays} {t('inquiry.days', 'days')} {t('inquiry.leadTime', 'lead time')}
            </span>
          )}
          {message.quoteValidUntil && (
            <span>
              {t('inquiry.validUntil', 'Valid until')}: {new Date(message.quoteValidUntil).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getMessageStyle = (message: Message) => {
    const isOwn = message.senderOrgId === currentOrgId;

    // Special message types
    if (message.messageType === InquiryMessageType.SYSTEM) {
      return 'bg-gray-100 text-gray-600 text-center mx-auto max-w-md';
    }
    if (message.messageType === InquiryMessageType.ACCEPTANCE) {
      return 'bg-green-50 border-green-200 ' + (isOwn ? 'ml-auto' : 'mr-auto');
    }
    if (message.messageType === InquiryMessageType.REJECTION) {
      return 'bg-red-50 border-red-200 ' + (isOwn ? 'ml-auto' : 'mr-auto');
    }

    return isOwn
      ? 'bg-blue-50 border-blue-200 ml-auto'
      : 'bg-white border-gray-200 mr-auto';
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.senderOrgId === currentOrgId;
        const isSystemMessage = message.messageType === InquiryMessageType.SYSTEM;

        return (
          <div
            key={message.id}
            className={clsx(
              'max-w-[80%] rounded-lg border p-4',
              getMessageStyle(message)
            )}
          >
            {/* Header */}
            {!isSystemMessage && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {message.senderUser?.name || t('inquiry.unknown', 'Unknown')}
                </span>
                {message.messageType !== InquiryMessageType.MESSAGE && (
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded-full',
                      message.messageType === InquiryMessageType.QUOTE && 'bg-blue-100 text-blue-700',
                      message.messageType === InquiryMessageType.COUNTER_OFFER && 'bg-purple-100 text-purple-700',
                      message.messageType === InquiryMessageType.ACCEPTANCE && 'bg-green-100 text-green-700',
                      message.messageType === InquiryMessageType.REJECTION && 'bg-red-100 text-red-700'
                    )}
                  >
                    {INQUIRY_MESSAGE_TYPE_NAMES[message.messageType]}
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            {message.content && (
              <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
            )}

            {/* Quote details */}
            {renderQuoteDetails(message)}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>{formatDate(message.createdAt)}</span>
              {!isSystemMessage && !isOwn && !message.isRead && (
                <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-[10px]">
                  {t('inquiry.new', 'New')}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('inquiry.noMessages', 'No messages yet')}
        </div>
      )}
    </div>
  );
}
