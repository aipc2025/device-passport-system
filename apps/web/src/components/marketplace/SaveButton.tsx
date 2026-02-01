import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savedApi } from '../../services/api';
import { SavedItemType } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface SaveButtonProps {
  itemType: SavedItemType;
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function SaveButton({
  itemType,
  itemId,
  size = 'md',
  showLabel = false,
}: SaveButtonProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  const { data: checkResult } = useQuery({
    queryKey: ['saved-check', itemType, itemId],
    queryFn: () => savedApi.checkSaved(itemType, itemId),
  });

  const isSaved = checkResult?.isSaved || false;

  const saveMutation = useMutation({
    mutationFn: () => savedApi.save({ itemType, itemId }),
    onSuccess: (data) => {
      setSavedItemId(data.id);
      queryClient.invalidateQueries({ queryKey: ['saved-check', itemType, itemId] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      toast.success(t('marketplace.saved', 'Saved successfully'));
    },
    onError: () => {
      toast.error(t('marketplace.saveFailed', 'Failed to save'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => savedApi.remove(id),
    onSuccess: () => {
      setSavedItemId(null);
      queryClient.invalidateQueries({ queryKey: ['saved-check', itemType, itemId] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      toast.success(t('marketplace.unsaved', 'Removed from saved'));
    },
    onError: () => {
      toast.error(t('marketplace.unsaveFailed', 'Failed to remove'));
    },
  });

  const handleClick = () => {
    if (isSaved && savedItemId) {
      removeMutation.mutate(savedItemId);
    } else {
      saveMutation.mutate();
    }
  };

  const isLoading = saveMutation.isPending || removeMutation.isPending;

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={clsx(
        'rounded-full transition-colors flex items-center gap-1',
        sizeClasses[size],
        isSaved
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      title={isSaved ? t('marketplace.unsave', 'Remove from saved') : t('marketplace.save', 'Save')}
    >
      <Heart
        className={clsx(iconSizes[size], isSaved && 'fill-current')}
      />
      {showLabel && (
        <span className="text-sm">
          {isSaved ? t('marketplace.saved', 'Saved') : t('marketplace.save', 'Save')}
        </span>
      )}
    </button>
  );
}
