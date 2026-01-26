import { useRef, useEffect, type KeyboardEvent } from 'react';

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  requiredLetter: string;
  error: string | null;
  disabled?: boolean;
}

export function WordInput({
  value,
  onChange,
  onSubmit,
  requiredLetter,
  error,
  disabled = false,
}: WordInputProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  const hasCorrectStart = value.length > 0 && value[0].toLowerCase() === requiredLetter.toLowerCase();
  const hasWrongStart = value.length > 0 && value[0].toLowerCase() !== requiredLetter.toLowerCase();

  return (
    <div className="space-y-3">
      {/* Required letter indicator */}
      <div className="text-center">
        <span className="text-[var(--text-secondary)]">Next word must start with: </span>
        <span className="text-2xl font-bold text-accent-primary">{requiredLetter}</span>
      </div>

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`Type a word starting with ${requiredLetter}...`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={`
            w-full px-4 py-4 text-lg rounded-xl border-2
            bg-[var(--bg-primary)] text-[var(--text-primary)]
            placeholder-[var(--text-secondary)]
            focus:outline-none transition-colors
            ${error ? 'border-red-500 dark:border-red-400' : ''}
            ${hasCorrectStart && !error ? 'border-green-500 dark:border-green-400' : ''}
            ${hasWrongStart && !error ? 'border-yellow-500 dark:border-yellow-400' : ''}
            ${!error && !hasCorrectStart && !hasWrongStart ? 'border-gray-300 dark:border-gray-600 focus:border-accent-primary' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Inline error/status indicator */}
        {hasWrongStart && !error && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 text-sm">
            Wrong letter!
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center">
          <span className="text-red-500 dark:text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg transition-all
          ${disabled || !value.trim()
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-accent-primary text-white hover:opacity-90 active:scale-[0.98]'
          }
        `}
      >
        Submit
      </button>
    </div>
  );
}
