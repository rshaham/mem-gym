import type { CellPosition } from '../../../types';

/**
 * Check if placing a number at a position is valid
 */
export function isValidPlacement(
  grid: (number | null)[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const checkRow = boxRow + r;
      const checkCol = boxCol + c;
      if (checkRow !== row || checkCol !== col) {
        if (grid[checkRow][checkCol] === num) return false;
      }
    }
  }

  return true;
}

/**
 * Find all cells with conflicts (same number in row/col/box)
 * Returns set of "row,col" strings
 */
export function findConflicts(grid: (number | null)[][]): Set<string> {
  const conflicts = new Set<string>();

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      if (value === null) continue;

      // Check row
      for (let c = 0; c < 9; c++) {
        if (c !== col && grid[row][c] === value) {
          conflicts.add(`${row},${col}`);
          conflicts.add(`${row},${c}`);
        }
      }

      // Check column
      for (let r = 0; r < 9; r++) {
        if (r !== row && grid[r][col] === value) {
          conflicts.add(`${row},${col}`);
          conflicts.add(`${r},${col}`);
        }
      }

      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const checkRow = boxRow + r;
          const checkCol = boxCol + c;
          if ((checkRow !== row || checkCol !== col) && grid[checkRow][checkCol] === value) {
            conflicts.add(`${row},${col}`);
            conflicts.add(`${checkRow},${checkCol}`);
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Check if puzzle is complete (all cells filled, no conflicts)
 */
export function isPuzzleComplete(grid: (number | null)[][]): boolean {
  // Check all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) return false;
    }
  }

  // Check no conflicts
  return findConflicts(grid).size === 0;
}

/**
 * Get all cells related to a position (same row, column, and 3x3 box)
 */
export function getRelatedCells(row: number, col: number): CellPosition[] {
  const related: CellPosition[] = [];
  const seen = new Set<string>();

  // Add row cells
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      const key = `${row},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        related.push({ row, col: c });
      }
    }
  }

  // Add column cells
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      const key = `${r},${col}`;
      if (!seen.has(key)) {
        seen.add(key);
        related.push({ row: r, col });
      }
    }
  }

  // Add 3x3 box cells
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const checkRow = boxRow + r;
      const checkCol = boxCol + c;
      if (checkRow !== row || checkCol !== col) {
        const key = `${checkRow},${checkCol}`;
        if (!seen.has(key)) {
          seen.add(key);
          related.push({ row: checkRow, col: checkCol });
        }
      }
    }
  }

  return related;
}

/**
 * Count how many of each digit are placed on the grid
 */
export function getDigitCounts(grid: (number | null)[][]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    counts[i] = 0;
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      if (value !== null) {
        counts[value]++;
      }
    }
  }

  return counts;
}
