import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DollarSign, Clock, Send } from 'lucide-react';
import { InquiryMessageType } from '@device-passport/shared';

interface QuoteFormData {
  content?: string;
  quotePrice?: number;
  quoteCurrency: string;
  quoteValidUntil?: string;
  quotedLeadTimeDays?: number;
}

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData, messageType: InquiryMessageType) => Promise<void>;
  isSubmitting?: boolean;
  showQuoteFields?: boolean;
  defaultCurrency?: string;
}

export default function QuoteForm({
  onSubmit,
  isSubmitting = false,
  showQuoteFields = true,
  defaultCurrency = 'USD',
}: QuoteFormProps) {
  const { t } = useTranslation();
  const [messageType, setMessageType] = useState<InquiryMessageType>(InquiryMessageType.MESSAGE);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    defaultValues: {
      quoteCurrency: defaultCurrency,
    },
  });

  const handleFormSubmit = async (data: QuoteFormData) => {
    await onSubmit(data, messageType);
    reset();
    setMessageType(InquiryMessageType.MESSAGE);
  };

  const isQuoteType = [InquiryMessageType.QUOTE, InquiryMessageType.COUNTER_OFFER].includes(messageType);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Message type selector */}
      {showQuoteFields && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMessageType(InquiryMessageType.MESSAGE)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              messageType === InquiryMessageType.MESSAGE
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('inquiry.message', 'Message')}
          </button>
          <button
            type="button"
            onClick={() => setMessageType(InquiryMessageType.QUOTE)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              messageType === InquiryMessageType.QUOTE
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {t('inquiry.quote', 'Quote')}
          </button>
          <button
            type="button"
            onClick={() => setMessageType(InquiryMessageType.COUNTER_OFFER)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              messageType === InquiryMessageType.COUNTER_OFFER
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
          >
            {t('inquiry.counterOffer', 'Counter Offer')}
          </button>
        </div>
      )}

      {/* Quote fields */}
      {isQuoteType && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('inquiry.price', 'Price')} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('quotePrice', {
                required: isQuoteType,
                min: 0,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('inquiry.currency', 'Currency')}
            </label>
            <select
              {...register('quoteCurrency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CNY">CNY</option>
              <option value="VND">VND</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              {t('inquiry.leadTimeDays', 'Lead Time (days)')}
            </label>
            <input
              type="number"
              min="0"
              {...register('quotedLeadTimeDays', { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('inquiry.validUntil', 'Valid Until')}
            </label>
            <input
              type="date"
              {...register('quoteValidUntil')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Message content */}
      <div>
        <textarea
          {...register('content', {
            required: messageType === InquiryMessageType.MESSAGE,
          })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder={
            isQuoteType
              ? t('inquiry.additionalNotes', 'Additional notes (optional)...')
              : t('inquiry.typeMessage', 'Type your message...')
          }
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{t('inquiry.messageRequired', 'Message is required')}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {isSubmitting
            ? t('inquiry.sending', 'Sending...')
            : isQuoteType
            ? t('inquiry.sendQuote', 'Send Quote')
            : t('inquiry.sendMessage', 'Send Message')}
        </button>
      </div>
    </form>
  );
}
