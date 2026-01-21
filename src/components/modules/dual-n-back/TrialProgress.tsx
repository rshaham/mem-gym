import { memo } from 'react';
import { ProgressBar } from '../../common/ProgressBar';

interface TrialProgressProps {
  current: number;
  total: number;
}

export const TrialProgress = memo(function TrialProgress({
  current,
  total,
}: TrialProgressProps): JSX.Element {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full space-y-2" aria-label={`Trial ${current} of ${total}`}>
      <p className="text-sm text-[var(--text-secondary)] text-center">
        Trial <span className="font-medium text-[var(--text-primary)]">{current}</span> of{' '}
        <span className="font-medium text-[var(--text-primary)]">{total}</span>
      </p>
      <ProgressBar
        value={percentage}
        max={100}
        size="sm"
        color="primary"
      />
    </div>
  );
});

TrialProgress.displayName = 'TrialProgress';
