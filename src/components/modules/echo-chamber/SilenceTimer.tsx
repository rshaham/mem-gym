import { Card } from '../../common/Card';

interface SilenceTimerProps {
  timeLeft: number;
  totalTime: number;
}

export function SilenceTimer({ timeLeft, totalTime }: SilenceTimerProps): JSX.Element {
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const displaySeconds = Math.ceil(timeLeft / 1000);

  // Calculate the circumference and offset for the circular progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <Card padding="lg" className="w-full max-w-md text-center">
        {/* Header */}
        <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-6">
          Processing...
        </h2>

        {/* Circular Timer */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 140 140"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-echo-chamber transition-all duration-100"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold text-echo-chamber"
              aria-live="polite"
              aria-atomic="true"
            >
              {displaySeconds}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">seconds</span>
          </div>
        </div>

        {/* Pulsing animation */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-echo-chamber animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>

        {/* Help text */}
        <p className="text-sm text-[var(--text-secondary)]">
          Let the sentence settle in your memory
        </p>
      </Card>
    </div>
  );
}
