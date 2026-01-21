interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'custom';
  customColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colorStyles = {
  primary: 'bg-accent-primary',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  error: 'bg-accent-error',
  custom: '',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  customColor,
  showLabel = false,
  label,
  animated = false,
}: ProgressBarProps): JSX.Element {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-[var(--text-secondary)]">{label}</span>}
          {showLabel && (
            <span className="text-[var(--text-primary)] font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full transition-all duration-normal ${
            color === 'custom' && customColor ? '' : colorStyles[color]
          } ${animated ? 'animate-pulse' : ''}`}
          style={{
            width: `${percentage}%`,
            ...(color === 'custom' && customColor ? { backgroundColor: customColor } : {}),
          }}
        />
      </div>
    </div>
  );
}
