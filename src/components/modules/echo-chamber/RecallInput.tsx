import { useState, useRef, useEffect } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

interface RecallInputProps {
  onSubmit: (text: string) => void;
  timeLeft: number;
}

export function RecallInput({ onSubmit, timeLeft }: RecallInputProps): JSX.Element {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmittedRef = useRef(false);

  const displaySeconds = Math.ceil(timeLeft / 1000);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      onSubmit(inputText.trim());
    }
  }, [timeLeft, inputText, onSubmit]);

  function handleSubmit(): void {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    onSubmit(inputText.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Calculate time color based on remaining time
  function getTimeColor(): string {
    if (displaySeconds <= 5) return 'text-red-500';
    if (displaySeconds <= 10) return 'text-amber-500';
    return 'text-echo-chamber';
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <Card padding="lg" className="w-full max-w-md">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            What do you remember?
          </h2>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${getTimeColor()}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <svg
              className="w-4 h-4"
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
            <span className="font-mono font-semibold">{displaySeconds}s</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the sentence here..."
            rows={4}
            className="
              w-full p-4 text-lg
              bg-[var(--bg-primary)] text-[var(--text-primary)]
              border-2 border-gray-200 dark:border-gray-700
              rounded-xl resize-none
              placeholder:text-[var(--text-secondary)]
              focus:outline-none focus:border-echo-chamber focus:ring-2 focus:ring-echo-chamber/20
              transition-colors duration-fast
            "
            aria-label="Type the sentence you remember"
          />
          <div className="absolute bottom-2 right-2 text-xs text-[var(--text-secondary)]">
            {inputText.length} characters
          </div>
        </div>

        {/* Help text */}
        <p className="text-sm text-[var(--text-secondary)] mb-4 text-center">
          Try to recall the exact words and order
        </p>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={inputText.trim().length === 0}
          aria-label="Submit your answer"
          className="!bg-echo-chamber hover:!bg-[#e68a00] active:!bg-[#cc7a00] disabled:!bg-gray-300"
        >
          Submit
        </Button>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-[var(--text-secondary)] mt-3 text-center">
          Press Ctrl+Enter to submit quickly
        </p>
      </Card>
    </div>
  );
}
