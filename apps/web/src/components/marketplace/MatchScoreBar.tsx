import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface ScoreBreakdown {
  categoryMatch: number;
  hsCodeMatch: number;
  priceRangeMatch: number;
  locationProximity: number;
  textSimilarity: number;
  frequencyMatch: number;
}

interface MatchScoreBarProps {
  totalScore: number;
  breakdown?: ScoreBreakdown;
  distanceKm?: number;
  showBreakdown?: boolean;
}

export default function MatchScoreBar({
  totalScore,
  breakdown,
  distanceKm,
  showBreakdown = false,
}: MatchScoreBarProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t('matching.excellent', 'Excellent Match');
    if (score >= 70) return t('matching.good', 'Good Match');
    if (score >= 50) return t('matching.moderate', 'Moderate Match');
    return t('matching.low', 'Low Match');
  };

  const breakdownItems = breakdown
    ? [
        { key: 'locationProximity', label: t('matching.location', 'Location'), max: 25 },
        { key: 'categoryMatch', label: t('matching.category', 'Category'), max: 20 },
        { key: 'hsCodeMatch', label: t('matching.hsCode', 'HS Code'), max: 20 },
        { key: 'priceRangeMatch', label: t('matching.price', 'Price'), max: 15 },
        { key: 'textSimilarity', label: t('matching.description', 'Description'), max: 10 },
        { key: 'frequencyMatch', label: t('matching.frequency', 'Frequency'), max: 10 },
      ]
    : [];

  return (
    <div className="space-y-3">
      {/* Main score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {t('matching.score', 'Match Score')}
          </span>
          <span
            className={clsx(
              'text-sm font-bold',
              totalScore >= 85 ? 'text-green-600' :
              totalScore >= 70 ? 'text-blue-600' :
              totalScore >= 50 ? 'text-yellow-600' : 'text-gray-500'
            )}
          >
            {totalScore}/100
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', getScoreColor(totalScore))}
            style={{ width: `${totalScore}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{getScoreLabel(totalScore)}</span>
          {distanceKm !== undefined && distanceKm !== null && (
            <span className="text-xs text-gray-500">
              {distanceKm < 1 ? '< 1' : Math.round(distanceKm)} km
            </span>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && breakdown && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t('matching.breakdown', 'Score Breakdown')}
          </p>
          {breakdownItems.map((item) => {
            const score = breakdown[item.key as keyof ScoreBreakdown] || 0;
            const percentage = (score / item.max) * 100;
            return (
              <div key={item.key} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-24 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full',
                      percentage >= 80 ? 'bg-green-400' :
                      percentage >= 50 ? 'bg-blue-400' :
                      percentage > 0 ? 'bg-yellow-400' : 'bg-gray-300'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {score}/{item.max}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
