import { Button } from '../../common/Button';
import { UndoIcon, EraserIcon, PencilIcon } from '../../icons';

interface NumberPadProps {
  onNumberPress: (num: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onTogglePencil: () => void;
  isPencilMode: boolean;
  digitCounts: Record<number, number>;
  disabled?: boolean;
}

export function NumberPad({
  onNumberPress,
  onUndo,
  onClear,
  onTogglePencil,
  isPencilMode,
  digitCounts,
  disabled = false,
}: NumberPadProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Number buttons */}
      <div className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = digitCounts[num];
          const isComplete = count >= 9;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onNumberPress(num)}
              disabled={disabled || isComplete}
              className={`
                relative min-h-12 min-w-11 rounded-lg font-bold text-xl transition-all
                ${isComplete
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                }
                ${disabled ? 'opacity-50' : ''}
                border border-gray-200 dark:border-gray-700
              `}
              aria-label={`Place number ${num}${isComplete ? ' (complete)' : ''}`}
            >
              {num}
              <span className="absolute bottom-0.5 right-1 text-[10px] text-[var(--text-secondary)]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          size="md"
          onClick={onUndo}
          disabled={disabled}
          aria-label="Undo last move"
        >
          <UndoIcon className="w-5 h-5 mr-1" />
          Undo
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onClear}
          disabled={disabled}
          aria-label="Clear selected cell"
        >
          <EraserIcon className="w-5 h-5 mr-1" />
          Clear
        </Button>

        <Button
          variant={isPencilMode ? 'primary' : 'secondary'}
          size="md"
          onClick={onTogglePencil}
          disabled={disabled}
          aria-label={isPencilMode ? 'Switch to pen mode' : 'Switch to pencil mode'}
          aria-pressed={isPencilMode}
        >
          <PencilIcon className="w-5 h-5 mr-1" />
          {isPencilMode ? 'Notes On' : 'Notes'}
        </Button>
      </div>
    </div>
  );
}
