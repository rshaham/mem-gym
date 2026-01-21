interface ResponseBarProps {
  onPositionPress: () => void;
  onSoundPress: () => void;
  disabled?: boolean;
  positionPressed?: boolean;
  soundPressed?: boolean;
  showKeyboardHints?: boolean;
}

export function ResponseBar({
  onPositionPress,
  onSoundPress,
  disabled = false,
  positionPressed = false,
  soundPressed = false,
  showKeyboardHints = false,
}: ResponseBarProps): JSX.Element {
  const baseButtonStyles = `
    flex-1 min-h-touch-comfortable py-4
    font-semibold text-lg text-white
    rounded-xl
    transition-all duration-fast
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
  `;

  const positionStyles = positionPressed
    ? 'bg-blue-700 scale-95'
    : 'bg-dual-n-back hover:bg-blue-600 active:scale-95 active:bg-blue-700';

  const soundStyles = soundPressed
    ? 'bg-purple-700 scale-95'
    : 'bg-purple-600 hover:bg-purple-700 active:scale-95 active:bg-purple-800';

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onPositionPress}
          disabled={disabled}
          aria-label="Position match (keyboard: A)"
          aria-pressed={positionPressed}
          className={`${baseButtonStyles} ${positionStyles} focus-visible:ring-dual-n-back flex-col gap-1`}
        >
          <span>Position</span>
          {showKeyboardHints && (
            <span className="text-xs opacity-70 font-normal">Press A</span>
          )}
        </button>
        <button
          type="button"
          onClick={onSoundPress}
          disabled={disabled}
          aria-label="Sound match (keyboard: L)"
          aria-pressed={soundPressed}
          className={`${baseButtonStyles} ${soundStyles} focus-visible:ring-purple-600 flex-col gap-1`}
        >
          <span>Sound</span>
          {showKeyboardHints && (
            <span className="text-xs opacity-70 font-normal">Press L</span>
          )}
        </button>
      </div>
    </div>
  );
}
