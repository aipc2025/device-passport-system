import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { savedApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import clsx from 'clsx';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'PRODUCT' | 'RFQ' | 'SUPPLIER';
  isFavorited: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({
  itemId,
  itemType,
  isFavorited,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);

  const toggleMutation = useMutation({
    mutationFn: () => savedApi.toggle({ itemType, itemId }),
    onMutate: async () => {
      // Optimistic update
      setOptimisticFavorited(!optimisticFavorited);
    },
    onError: () => {
      // Revert on error
      setOptimisticFavorited(optimisticFavorited);
    },
    onSuccess: () => {
      // Invalidate saved items queries
      queryClient.invalidateQueries({ queryKey: ['saved-item-ids', itemType] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could show login prompt here
      return;
    }

    toggleMutation.mutate();
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={clsx(
        'rounded-full transition-all duration-200 hover:scale-110',
        buttonSizeClasses[size],
        optimisticFavorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-400',
        toggleMutation.isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={optimisticFavorited ? t('marketplace.removeFromFavorites') : t('marketplace.addToFavorites')}
    >
      <Heart
        className={clsx(
          sizeClasses[size],
          optimisticFavorited && 'fill-current'
        )}
      />
    </button>
  );
}
