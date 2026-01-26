import { memo } from 'react';

interface SudokuCellProps {
  value: number | null;
  notes: number[];
  isPrefilled: boolean;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  hasConflict: boolean;
  onClick: () => void;
}

export const SudokuCell = memo(function SudokuCell({
  value,
  notes,
  isPrefilled,
  isSelected,
  isRelated,
  isSameNumber,
  hasConflict,
  onClick,
}: SudokuCellProps): JSX.Element {
  // Build class names based on state
  const baseClasses = 'w-full h-full flex items-center justify-center cursor-pointer transition-colors select-none';

  let bgClasses = 'bg-[var(--bg-primary)]';
  if (isSelected) {
    bgClasses = 'bg-blue-200 dark:bg-blue-800';
  } else if (isSameNumber && value !== null) {
    bgClasses = 'bg-yellow-100 dark:bg-yellow-900/50';
  } else if (isRelated) {
    bgClasses = 'bg-blue-50 dark:bg-blue-950/50';
  }

  let textClasses = 'text-lg font-medium';
  if (isPrefilled) {
    textClasses = 'text-lg font-bold text-[var(--text-primary)]';
  } else if (hasConflict) {
    textClasses = 'text-lg font-medium text-red-600 dark:text-red-400';
  } else {
    textClasses = 'text-lg font-medium text-accent-primary';
  }

  const borderClasses = isSelected ? 'ring-2 ring-accent-primary ring-inset' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${bgClasses} ${borderClasses}`}
      aria-label={value ? `Cell value ${value}` : notes.length > 0 ? `Cell with notes ${notes.join(', ')}` : 'Empty cell'}
    >
      {value !== null ? (
        <span className={textClasses}>{value}</span>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span
              key={n}
              className="text-[8px] text-[var(--text-secondary)] flex items-center justify-center leading-none"
            >
              {notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
});
