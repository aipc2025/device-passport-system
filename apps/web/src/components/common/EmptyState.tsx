import { LucideIcon, Inbox, Search, FileQuestion, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  variant?: 'default' | 'search' | 'error';
  className?: string;
}

const variantConfig = {
  default: {
    icon: Inbox,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  search: {
    icon: Search,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-50',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-50',
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center',
        className
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          'p-4 rounded-full mb-4',
          config.bgColor
        )}
      >
        <Icon className={clsx('w-12 h-12 sm:w-16 sm:h-16', config.iconColor)} />
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm sm:text-base text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            'px-6 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
            action.variant === 'secondary'
              ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoDataEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      variant="default"
      title="No data available"
      description="There's nothing to display here yet."
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
        variant: 'secondary',
      } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={onClear ? {
        label: 'Clear filters',
        onClick: onClear,
        variant: 'secondary',
      } : undefined}
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description="We couldn't load this content. Please try again."
      action={onRetry ? {
        label: 'Try again',
        onClick: onRetry,
        variant: 'primary',
      } : undefined}
    />
  );
}

export function NoPermissionEmptyState() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="No permission"
      description="You don't have permission to view this content. Please contact your administrator if you think this is a mistake."
      variant="error"
    />
  );
}
