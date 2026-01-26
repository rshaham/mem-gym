import type { SudokuDifficulty } from '../../../types';

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Check if a number can be placed at position without violating Sudoku rules
 */
function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }

  return true;
}

/**
 * Fill a 3x3 box with random numbers
 */
function fillBox(grid: number[][], rowStart: number, colStart: number): void {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid[rowStart + r][colStart + c] = nums[idx++];
    }
  }
}

/**
 * Find the next empty cell (value = 0)
 */
function findEmpty(grid: number[][]): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) return [row, col];
    }
  }
  return null;
}

/**
 * Solve the Sudoku grid using backtracking
 */
function solve(grid: number[][]): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true; // Solved

  const [row, col] = empty;
  const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of candidates) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solve(grid)) return true;
      grid[row][col] = 0;
    }
  }

  return false;
}

/**
 * Generate a complete valid Sudoku solution
 */
function generateSolution(): number[][] {
  // Create empty 9x9 grid
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  // Fill diagonal 3x3 boxes first (they don't affect each other)
  fillBox(grid, 0, 0);
  fillBox(grid, 3, 3);
  fillBox(grid, 6, 6);

  // Solve the remaining cells
  solve(grid);

  return grid;
}

/**
 * Get clue count range for difficulty
 */
function getClueRange(difficulty: SudokuDifficulty): { min: number; max: number } {
  switch (difficulty) {
    case 'easy':
      return { min: 35, max: 40 };
    case 'medium':
      return { min: 28, max: 34 };
    case 'hard':
      return { min: 22, max: 27 };
  }
}

/**
 * Remove cells from a complete solution to create a puzzle
 */
function createPuzzle(solution: number[][], difficulty: SudokuDifficulty): number[][] {
  const puzzle = solution.map(row => [...row]);
  const { min, max } = getClueRange(difficulty);
  const targetClues = Math.floor(Math.random() * (max - min + 1)) + min;
  const cellsToRemove = 81 - targetClues;

  // Create list of all cell positions and shuffle
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  // Remove cells
  let removed = 0;
  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove) break;
    puzzle[row][col] = 0;
    removed++;
  }

  return puzzle;
}

/**
 * Generate a Sudoku puzzle with the given difficulty
 * Returns both the puzzle (0 = empty) and the complete solution
 */
export function generatePuzzle(difficulty: SudokuDifficulty): {
  puzzle: number[][];
  solution: number[][];
} {
  const solution = generateSolution();
  const puzzle = createPuzzle(solution, difficulty);

  return { puzzle, solution };
}

/**
 * Convert numeric grid to nullable grid for game state
 */
export function toNullableGrid(grid: number[][]): (number | null)[][] {
  return grid.map(row => row.map(cell => (cell === 0 ? null : cell)));
}

/**
 * Create initial game cells from puzzle
 */
export function createInitialCells(puzzle: number[][]): {
  value: number | null;
  notes: number[];
  isPrefilled: boolean;
  hasConflict: boolean;
}[][] {
  return puzzle.map(row =>
    row.map(cell => ({
      value: cell === 0 ? null : cell,
      notes: [],
      isPrefilled: cell !== 0,
      hasConflict: false,
    }))
  );
}
