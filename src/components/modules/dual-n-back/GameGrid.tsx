import { memo } from 'react';

interface GameGridProps {
  highlightedCell: number | null;
}

interface GridCellProps {
  index: number;
  isHighlighted: boolean;
}

const GridCell = memo(function GridCell({ index, isHighlighted }: GridCellProps): JSX.Element {
  return (
    <div
      className={`
        aspect-square rounded-lg
        min-h-11 min-w-11
        transition-colors duration-150
        ${
          isHighlighted
            ? 'bg-[var(--accent-primary)]'
            : 'bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600'
        }
      `}
      role="gridcell"
      aria-label={`Cell ${index + 1}${isHighlighted ? ', highlighted' : ''}`}
      aria-selected={isHighlighted}
    />
  );
});

GridCell.displayName = 'GridCell';

export const GameGrid = memo(function GameGrid({ highlightedCell }: GameGridProps): JSX.Element {
  return (
    <div
      className="w-full max-w-xs mx-auto"
      role="grid"
      aria-label="Dual N-Back game grid"
    >
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, index) => (
          <GridCell
            key={index}
            index={index}
            isHighlighted={highlightedCell === index}
          />
        ))}
      </div>
    </div>
  );
});

GameGrid.displayName = 'GameGrid';
