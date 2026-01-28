interface NumberPadProps {
  onDigit: (digit: number) => void;
  onNegative: () => void;
  onClear: () => void;
  onSubmit: () => void;
  currentValue: string;
  disabled?: boolean;
}

export function NumberPad({
  onDigit,
  onNegative,
  onClear,
  onSubmit,
  currentValue,
  disabled = false,
}: NumberPadProps): JSX.Element {
  return (
    <div className="w-full px-4 pb-6 space-y-3">
      {/* Input display */}
      <div className="flex items-center justify-center h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
        <span className="text-4xl font-mono font-bold text-[var(--text-primary)] tabular-nums">
          {currentValue || '0'}
        </span>
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigit(digit)}
            disabled={disabled}
            aria-label={`${digit}`}
            className="flex items-center justify-center h-14 text-2xl font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 active:bg-gray-300 dark:active:bg-gray-600 transition-all duration-100 disabled:opacity-50"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={onNegative}
          disabled={disabled}
          aria-label="Toggle negative"
          className="flex items-center justify-center h-14 text-xl font-semibold rounded-xl bg-gray-200 dark:bg-gray-700 text-[var(--text-secondary)] hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-100 disabled:opacity-50"
        >
          +/−
        </button>
        <button
          type="button"
          onClick={() => onDigit(0)}
          disabled={disabled}
          aria-label="0"
          className="flex items-center justify-center h-14 text-2xl font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 active:bg-gray-300 dark:active:bg-gray-600 transition-all duration-100 disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label="Delete"
          className="flex items-center justify-center h-14 rounded-xl bg-gray-200 dark:bg-gray-700 text-[var(--text-secondary)] hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-100 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>

      {/* Submit button - full width, prominent */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || currentValue === ''}
        aria-label="Submit answer"
        className="w-full h-14 text-xl font-bold text-white rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
      >
        Submit
      </button>
    </div>
  );
}
