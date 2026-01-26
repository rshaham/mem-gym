import type { SudokuCell as SudokuCellType, CellPosition } from '../../../types';
import { SudokuCell } from './SudokuCell';

interface SudokuGridProps {
  puzzle: SudokuCellType[][];
  selectedCell: CellPosition | null;
  highlightedNumber: number | null;
  relatedCells: Set<string>;
  onCellSelect: (row: number, col: number) => void;
}

export function SudokuGrid({
  puzzle,
  selectedCell,
  highlightedNumber,
  relatedCells,
  onCellSelect,
}: SudokuGridProps): JSX.Element {
  return (
    <div
      className="grid grid-cols-9 border-2 border-gray-800 dark:border-gray-300 bg-gray-400 dark:bg-gray-600 gap-px aspect-square w-full max-w-[400px]"
      role="grid"
      aria-label="Sudoku puzzle grid"
    >
      {puzzle.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isRelated = relatedCells.has(`${rowIndex},${colIndex}`);
          const isSameNumber =
            highlightedNumber !== null &&
            cell.value === highlightedNumber &&
            !isSelected;

          // Calculate border classes for 3x3 box separation
          const isRightBoxBorder = colIndex === 2 || colIndex === 5;
          const isBottomBoxBorder = rowIndex === 2 || rowIndex === 5;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                ${isRightBoxBorder ? 'border-r-2 border-r-gray-800 dark:border-r-gray-300' : ''}
                ${isBottomBoxBorder ? 'border-b-2 border-b-gray-800 dark:border-b-gray-300' : ''}
              `}
              role="gridcell"
              aria-rowindex={rowIndex + 1}
              aria-colindex={colIndex + 1}
            >
              <SudokuCell
                value={cell.value}
                notes={cell.notes}
                isPrefilled={cell.isPrefilled}
                isSelected={isSelected}
                isRelated={isRelated}
                isSameNumber={isSameNumber}
                hasConflict={cell.hasConflict}
                onClick={() => onCellSelect(rowIndex, colIndex)}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
