import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

interface WaitingScreenProps {
  delayMinutes: number;
  scheduledTime: number; // timestamp when quiz should start
  onReady: () => void; // called when user clicks "Start Quiz"
  onCancel: () => void; // called if user wants to exit
}

function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return '0:00';
  }

  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function WaitingScreen({
  delayMinutes,
  scheduledTime,
  onReady,
  onCancel,
}: WaitingScreenProps): JSX.Element | null {
  const [timeRemaining, setTimeRemaining] = useState<number>(
    scheduledTime - Date.now()
  );
  const [isReady, setIsReady] = useState<boolean>(false);

  const checkIfReady = useCallback((): void => {
    const now = Date.now();
    const remaining = scheduledTime - now;

    if (remaining <= 0) {
      setIsReady(true);
      setTimeRemaining(0);
    } else {
      setTimeRemaining(remaining);
    }
  }, [scheduledTime]);

  useEffect(() => {
    // Check immediately on mount
    checkIfReady();

    // Update every second while waiting
    const intervalId = setInterval(checkIfReady, 1000);

    return () => clearInterval(intervalId);
  }, [checkIfReady]);

  // If delay is 0, parent should skip this phase - return null
  if (delayMinutes === 0) {
    return null;
  }

  const isLongDelay = delayMinutes >= 30;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <Card padding="lg" className="w-full max-w-md text-center">
        {isReady ? (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                Ready!
              </h2>
              <p className="text-[var(--text-secondary)]">
                Time to test your memory. How much do you remember?
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onReady}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
              aria-label="Start the quiz"
            >
              Start Quiz
            </Button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Quiz ready in
              </h2>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatTimeRemaining(timeRemaining)}
              </p>
            </div>

            {isLongDelay && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Come back later! We'll keep track of when your quiz is ready.
                  Feel free to close this page.
                </p>
              </div>
            )}

            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              The delay helps strengthen memory consolidation.
            </p>
          </>
        )}

        <button
          onClick={onCancel}
          className="mt-4 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
          aria-label="Cancel and exit"
        >
          Cancel
        </button>
      </Card>
    </div>
  );
}
