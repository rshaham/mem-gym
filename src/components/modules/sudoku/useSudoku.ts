import { useState, useCallback, useEffect, useRef } from 'react';
import type { SudokuDifficulty, SudokuCell, CellPosition, SudokuSession } from '../../../types';
import { generatePuzzle, createInitialCells } from './sudokuGenerator';
import { findConflicts, isPuzzleComplete, getRelatedCells } from './sudokuValidator';

// ============ TYPES ============

interface HistoryEntry {
  position: CellPosition;
  previousValue: number | null;
  previousNotes: number[];
  newValue: number | null;
  newNotes: number[];
}

interface UseSudokuOptions {
  onSessionComplete?: (session: SudokuSession) => void;
}

interface UseSudokuReturn {
  // State
  puzzle: SudokuCell[][];
  solution: number[][];
  selectedCell: CellPosition | null;
  isPencilMode: boolean;
  moveCount: number;
  elapsedTime: number;
  isComplete: boolean;
  isPaused: boolean;
  difficulty: SudokuDifficulty;

  // Derived
  highlightedNumber: number | null;
  relatedCells: Set<string>;
  digitCounts: Record<number, number>;

  // Actions
  startGame: (difficulty: SudokuDifficulty) => void;
  selectCell: (row: number, col: number) => void;
  placeNumber: (num: number) => void;
  togglePencilMode: () => void;
  clearCell: () => void;
  undo: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

// ============ HOOK ============

export function useSudoku({ onSessionComplete }: UseSudokuOptions = {}): UseSudokuReturn {
  // Game state
  const [puzzle, setPuzzle] = useState<SudokuCell[][]>(() => createEmptyGrid());
  const [solution, setSolution] = useState<number[][]>(() => createEmptyNumericGrid());
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Refs for timing
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);

  // Keep callback ref updated
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && !isComplete) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isPaused, isComplete]);

  // Derived state: highlighted number (from selected cell)
  const highlightedNumber = selectedCell
    ? puzzle[selectedCell.row][selectedCell.col].value
    : null;

  // Derived state: related cells for highlighting
  const relatedCells = new Set<string>();
  if (selectedCell) {
    const related = getRelatedCells(selectedCell.row, selectedCell.col);
    for (const { row, col } of related) {
      relatedCells.add(`${row},${col}`);
    }
  }

  // Derived state: digit counts
  const digitCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = puzzle[r][c].value;
      if (val !== null) {
        digitCounts[val]++;
      }
    }
  }

  // Start a new game
  const startGame = useCallback((diff: SudokuDifficulty) => {
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle(diff);
    const cells = createInitialCells(newPuzzle);

    setPuzzle(cells);
    setSolution(newSolution);
    setDifficulty(diff);
    setSelectedCell(null);
    setIsPencilMode(false);
    setHistory([]);
    setMoveCount(0);
    setElapsedTime(0);
    setIsComplete(false);
    setIsPaused(false);
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, []);

  // Select a cell
  const selectCell = useCallback((row: number, col: number) => {
    if (isComplete) return;
    setSelectedCell({ row, col });
  }, [isComplete]);

  // Update conflicts across the grid
  const updateConflicts = useCallback((grid: SudokuCell[][]): SudokuCell[][] => {
    const valueGrid = grid.map(row => row.map(cell => cell.value));
    const conflicts = findConflicts(valueGrid);

    return grid.map((row, r) =>
      row.map((cell, c) => ({
        ...cell,
        hasConflict: conflicts.has(`${r},${c}`),
      }))
    );
  }, []);

  // Remove note from related cells
  const removeNoteFromRelated = useCallback(
    (grid: SudokuCell[][], row: number, col: number, num: number): SudokuCell[][] => {
      const related = getRelatedCells(row, col);
      const newGrid = grid.map(r => r.map(c => ({ ...c })));

      for (const { row: r, col: c } of related) {
        const cell = newGrid[r][c];
        if (cell.notes.includes(num)) {
          cell.notes = cell.notes.filter(n => n !== num);
        }
      }

      return newGrid;
    },
    []
  );

  // Place a number or toggle note
  const placeNumber = useCallback((num: number) => {
    if (!selectedCell || isComplete || isPaused) return;

    const { row, col } = selectedCell;
    const cell = puzzle[row][col];

    // Can't modify prefilled cells
    if (cell.isPrefilled) return;

    // Save to history
    const historyEntry: HistoryEntry = {
      position: { row, col },
      previousValue: cell.value,
      previousNotes: [...cell.notes],
      newValue: cell.value,
      newNotes: [...cell.notes],
    };

    let newPuzzle = puzzle.map(r => r.map(c => ({ ...c })));

    if (isPencilMode) {
      // Toggle note
      const currentNotes = newPuzzle[row][col].notes;
      if (currentNotes.includes(num)) {
        newPuzzle[row][col].notes = currentNotes.filter(n => n !== num);
      } else {
        newPuzzle[row][col].notes = [...currentNotes, num].sort((a, b) => a - b);
      }
      historyEntry.newNotes = [...newPuzzle[row][col].notes];
    } else {
      // Place number
      if (cell.value === num) {
        // Clicking same number clears it
        newPuzzle[row][col].value = null;
        historyEntry.newValue = null;
      } else {
        newPuzzle[row][col].value = num;
        newPuzzle[row][col].notes = []; // Clear notes when placing number
        historyEntry.newValue = num;
        historyEntry.newNotes = [];

        // Auto-remove this number from related cells' notes
        newPuzzle = removeNoteFromRelated(newPuzzle, row, col, num);
      }
    }

    // Update conflicts
    newPuzzle = updateConflicts(newPuzzle);

    setPuzzle(newPuzzle);
    setHistory(prev => [...prev, historyEntry]);
    setMoveCount(prev => prev + 1);

    // Check for completion
    const valueGrid = newPuzzle.map(r => r.map(c => c.value));
    if (isPuzzleComplete(valueGrid)) {
      setIsComplete(true);
      setIsRunning(false);

      // Calculate XP
      const baseXP = 40;
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2.5;
      const targetTime = difficulty === 'easy' ? 600 : difficulty === 'medium' ? 900 : 1200;
      let timeBonus = 0;
      if (elapsedTime < targetTime * 0.5) timeBonus = 50;
      else if (elapsedTime < targetTime * 0.75) timeBonus = 25;
      else if (elapsedTime < targetTime) timeBonus = 10;

      const xpEarned = Math.floor(baseXP * difficultyMultiplier) + timeBonus;

      const session: SudokuSession = {
        id: crypto.randomUUID(),
        difficulty,
        startedAt: startTimeRef.current,
        completedAt: Date.now(),
        timeElapsed: elapsedTime,
        moveCount,
        xpEarned,
      };

      onSessionCompleteRef.current?.(session);
    }
  }, [selectedCell, isComplete, isPaused, puzzle, isPencilMode, difficulty, elapsedTime, moveCount, removeNoteFromRelated, updateConflicts]);

  // Toggle pencil mode
  const togglePencilMode = useCallback(() => {
    setIsPencilMode(prev => !prev);
  }, []);

  // Clear selected cell
  const clearCell = useCallback(() => {
    if (!selectedCell || isComplete || isPaused) return;

    const { row, col } = selectedCell;
    const cell = puzzle[row][col];

    // Can't modify prefilled cells
    if (cell.isPrefilled) return;

    // Save to history
    const historyEntry: HistoryEntry = {
      position: { row, col },
      previousValue: cell.value,
      previousNotes: [...cell.notes],
      newValue: null,
      newNotes: [],
    };

    let newPuzzle = puzzle.map(r => r.map(c => ({ ...c })));
    newPuzzle[row][col].value = null;
    newPuzzle[row][col].notes = [];

    // Update conflicts
    newPuzzle = updateConflicts(newPuzzle);

    setPuzzle(newPuzzle);
    setHistory(prev => [...prev, historyEntry]);
    setMoveCount(prev => prev + 1);
  }, [selectedCell, isComplete, isPaused, puzzle, updateConflicts]);

  // Undo last move
  const undo = useCallback(() => {
    if (history.length === 0 || isComplete || isPaused) return;

    const lastEntry = history[history.length - 1];
    const { row, col } = lastEntry.position;

    let newPuzzle = puzzle.map(r => r.map(c => ({ ...c })));
    newPuzzle[row][col].value = lastEntry.previousValue;
    newPuzzle[row][col].notes = [...lastEntry.previousNotes];

    // Update conflicts
    newPuzzle = updateConflicts(newPuzzle);

    setPuzzle(newPuzzle);
    setHistory(prev => prev.slice(0, -1));
  }, [history, isComplete, isPaused, puzzle, updateConflicts]);

  // Pause game
  const pause = useCallback(() => {
    if (!isRunning || isComplete) return;
    setIsPaused(true);
  }, [isRunning, isComplete]);

  // Resume game
  const resume = useCallback(() => {
    if (!isPaused) return;
    // Adjust start time to account for pause duration
    const pausedDuration = elapsedTime * 1000;
    startTimeRef.current = Date.now() - pausedDuration;
    setIsPaused(false);
  }, [isPaused, elapsedTime]);

  // Reset to setup
  const reset = useCallback(() => {
    setPuzzle(createEmptyGrid());
    setSolution(createEmptyNumericGrid());
    setSelectedCell(null);
    setIsPencilMode(false);
    setHistory([]);
    setMoveCount(0);
    setElapsedTime(0);
    setIsComplete(false);
    setIsPaused(false);
    setIsRunning(false);
  }, []);

  return {
    puzzle,
    solution,
    selectedCell,
    isPencilMode,
    moveCount,
    elapsedTime,
    isComplete,
    isPaused,
    difficulty,
    highlightedNumber,
    relatedCells,
    digitCounts,
    startGame,
    selectCell,
    placeNumber,
    togglePencilMode,
    clearCell,
    undo,
    pause,
    resume,
    reset,
  };
}

// ============ HELPERS ============

function createEmptyGrid(): SudokuCell[][] {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: null,
      notes: [],
      isPrefilled: false,
      hasConflict: false,
    }))
  );
}

function createEmptyNumericGrid(): number[][] {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}
