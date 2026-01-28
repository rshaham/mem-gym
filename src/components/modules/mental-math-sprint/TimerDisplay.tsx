interface TimerDisplayProps {
  timeLeft: number; // milliseconds
  totalTime: number; // milliseconds
  isRunning: boolean;
}

export function TimerDisplay({
  timeLeft,
  totalTime,
  isRunning,
}: TimerDisplayProps): JSX.Element {
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const seconds = Math.ceil(timeLeft / 1000);

  // Determine color based on progress
  let colorClass = 'bg-accent-success';
  if (progress <= 25) {
    colorClass = 'bg-accent-error';
  } else if (progress <= 50) {
    colorClass = 'bg-accent-warning';
  }

  // Add pulse animation when low
  const shouldPulse = progress <= 25 && isRunning;

  return (
    <div className="w-full px-4">
      <div className="flex items-center gap-3">
        {/* Time text */}
        <span
          className={`text-lg font-mono font-semibold min-w-[3ch] ${
            progress <= 25
              ? 'text-accent-error'
              : progress <= 50
                ? 'text-accent-warning'
                : 'text-accent-success'
          } ${shouldPulse ? 'animate-pulse' : ''}`}
        >
          {seconds}s
        </span>

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-100 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
