import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star, Plus, X } from 'lucide-react';
import { ratingApi, CreateReviewDto } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ReviewFormProps {
  serviceRecordId: string;
  expertName: string;
  serviceTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  serviceRecordId,
  expertName,
  serviceTitle,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    overallRating: 0,
    qualityRating: 0,
    communicationRating: 0,
    punctualityRating: 0,
    professionalismRating: 0,
    valueRating: 0,
    title: '',
    comment: '',
    pros: [] as string[],
    cons: [] as string[],
  });

  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewDto) => ratingApi.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      toast.success(t('rating.reviewSubmitted', 'Review submitted successfully!'));
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('rating.submitError', 'Failed to submit review'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.overallRating === 0) {
      toast.error(t('rating.selectOverall', 'Please select an overall rating'));
      return;
    }

    const data: CreateReviewDto = {
      serviceRecordId,
      overallRating: formData.overallRating,
      qualityRating: formData.qualityRating || undefined,
      communicationRating: formData.communicationRating || undefined,
      punctualityRating: formData.punctualityRating || undefined,
      professionalismRating: formData.professionalismRating || undefined,
      valueRating: formData.valueRating || undefined,
      title: formData.title || undefined,
      comment: formData.comment || undefined,
      pros: formData.pros.length > 0 ? formData.pros : undefined,
      cons: formData.cons.length > 0 ? formData.cons : undefined,
    };

    createReviewMutation.mutate(data);
  };

  const renderStarInput = (
    label: string,
    value: number,
    onChange: (rating: number) => void,
    required = false
  ) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 focus:outline-none"
          >
            <Star
              className={clsx(
                'w-6 h-6 transition-colors',
                star <= value
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              )}
            />
          </button>
        ))}
        <span className="w-8 text-sm text-gray-500 text-right">{value || '-'}</span>
      </div>
    </div>
  );

  const addPro = () => {
    if (newPro.trim() && formData.pros.length < 5) {
      setFormData((prev) => ({ ...prev, pros: [...prev.pros, newPro.trim()] }));
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim() && formData.cons.length < 5) {
      setFormData((prev) => ({ ...prev, cons: [...prev.cons, newCon.trim()] }));
      setNewCon('');
    }
  };

  const removePro = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index),
    }));
  };

  const removeCon = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900">{t('rating.reviewFor', 'Review for')}</h3>
        <p className="text-sm text-gray-600 mt-1">{serviceTitle}</p>
        <p className="text-sm text-gray-500">{t('rating.expert', 'Expert')}: {expertName}</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          {t('rating.overallRating', 'Overall Rating')} <span className="text-red-500">*</span>
        </h4>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, overallRating: star }))}
              className="p-1 focus:outline-none"
            >
              <Star
                className={clsx(
                  'w-10 h-10 transition-colors',
                  star <= formData.overallRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                )}
              />
            </button>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          {formData.overallRating === 0 && t('rating.clickToRate', 'Click to rate')}
          {formData.overallRating === 1 && t('rating.poor', 'Poor')}
          {formData.overallRating === 2 && t('rating.fair', 'Fair')}
          {formData.overallRating === 3 && t('rating.good', 'Good')}
          {formData.overallRating === 4 && t('rating.veryGood', 'Very Good')}
          {formData.overallRating === 5 && t('rating.excellent', 'Excellent')}
        </div>
      </div>

      {/* Category Ratings */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          {t('rating.categoryRatings', 'Category Ratings')} ({t('common.optional', 'Optional')})
        </h4>
        {renderStarInput(
          t('rating.quality', 'Quality of Work'),
          formData.qualityRating,
          (r) => setFormData((prev) => ({ ...prev, qualityRating: r }))
        )}
        {renderStarInput(
          t('rating.communication', 'Communication'),
          formData.communicationRating,
          (r) => setFormData((prev) => ({ ...prev, communicationRating: r }))
        )}
        {renderStarInput(
          t('rating.punctuality', 'Punctuality'),
          formData.punctualityRating,
          (r) => setFormData((prev) => ({ ...prev, punctualityRating: r }))
        )}
        {renderStarInput(
          t('rating.professionalism', 'Professionalism'),
          formData.professionalismRating,
          (r) => setFormData((prev) => ({ ...prev, professionalismRating: r }))
        )}
        {renderStarInput(
          t('rating.value', 'Value for Money'),
          formData.valueRating,
          (r) => setFormData((prev) => ({ ...prev, valueRating: r }))
        )}
      </div>

      {/* Review Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('rating.reviewTitle', 'Review Title')} ({t('common.optional', 'Optional')})
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={t('rating.titlePlaceholder', 'Summarize your experience')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          maxLength={100}
        />
      </div>

      {/* Review Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('rating.reviewComment', 'Your Review')} ({t('common.optional', 'Optional')})
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
          placeholder={t('rating.commentPlaceholder', 'Share your experience with this expert...')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          maxLength={1000}
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {formData.comment.length}/1000
        </div>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('rating.pros', 'Pros')} ({t('common.optional', 'Optional')})
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.pros.map((pro, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full"
            >
              {pro}
              <button type="button" onClick={() => removePro(index)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {formData.pros.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              placeholder={t('rating.addPro', 'Add a positive point')}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={addPro}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('rating.cons', 'Cons')} ({t('common.optional', 'Optional')})
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.cons.map((con, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
            >
              {con}
              <button type="button" onClick={() => removeCon(index)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {formData.cons.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              placeholder={t('rating.addCon', 'Add an area for improvement')}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={addCon}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={createReviewMutation.isPending || formData.overallRating === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createReviewMutation.isPending
            ? t('common.submitting', 'Submitting...')
            : t('rating.submitReview', 'Submit Review')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
