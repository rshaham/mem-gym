/**
 * Levenshtein distance utilities for the Echo Chamber module.
 * Provides string comparison functions for measuring recall accuracy.
 */

/**
 * Represents the comparison result for a single word.
 */
export interface WordComparison {
  /** The word being compared (from recalled string for 'correct'/'incorrect'/'extra', from original for 'missing') */
  word: string;
  /** The comparison status */
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
  /** For 'incorrect' status, the word that was expected */
  expected?: string;
}

/**
 * Normalizes a string for comparison.
 * Converts to lowercase, trims whitespace, and collapses multiple spaces.
 *
 * @param str - The string to normalize
 * @returns The normalized string
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Uses the standard dynamic programming approach with O(m*n) time and O(min(m,n)) space.
 *
 * @param a - The first string
 * @param b - The second string
 * @returns The minimum number of single-character edits (insertions, deletions, substitutions)
 *          required to transform string a into string b
 *
 * @example
 * ```typescript
 * levenshteinDistance('kitten', 'sitting'); // Returns 3
 * levenshteinDistance('', 'abc'); // Returns 3
 * levenshteinDistance('abc', 'abc'); // Returns 0
 * ```
 */
export function levenshteinDistance(a: string, b: string): number {
  // Ensure a is the shorter string for space optimization
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;

  // Edge cases
  if (m === 0) return n;
  if (n === 0) return m;

  // Use single array with O(min(m,n)) space
  let previousRow: number[] = new Array(m + 1);
  let currentRow: number[] = new Array(m + 1);

  // Initialize first row
  for (let i = 0; i <= m; i++) {
    previousRow[i] = i;
  }

  // Fill the matrix row by row
  for (let j = 1; j <= n; j++) {
    currentRow[0] = j;

    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      currentRow[i] = Math.min(
        previousRow[i] + 1,      // deletion
        currentRow[i - 1] + 1,   // insertion
        previousRow[i - 1] + cost // substitution
      );
    }

    // Swap rows
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[m];
}

/**
 * Calculates a similarity score between two strings as a percentage (0-100).
 * Both strings are normalized before comparison (lowercase, trimmed, whitespace collapsed).
 *
 * @param original - The original string to compare against
 * @param recalled - The recalled string to evaluate
 * @returns A similarity score from 0 to 100, where 100 means identical strings
 *
 * @example
 * ```typescript
 * calculateSimilarity('Hello World', 'hello world'); // Returns 100 (case insensitive)
 * calculateSimilarity('The quick brown fox', 'The quick brown'); // Returns ~78
 * calculateSimilarity('abc', ''); // Returns 0
 * ```
 */
export function calculateSimilarity(original: string, recalled: string): number {
  const normalizedOriginal = normalizeString(original);
  const normalizedRecalled = normalizeString(recalled);

  // Handle edge case where both strings are empty
  if (normalizedOriginal.length === 0 && normalizedRecalled.length === 0) {
    return 100;
  }

  // Handle edge case where one string is empty
  const maxLength = Math.max(normalizedOriginal.length, normalizedRecalled.length);
  if (maxLength === 0) {
    return 100;
  }

  const distance = levenshteinDistance(normalizedOriginal, normalizedRecalled);
  const similarity = 100 * (1 - distance / maxLength);

  // Clamp to 0-100 range and round to avoid floating point issues
  return Math.max(0, Math.min(100, Math.round(similarity * 100) / 100));
}

/**
 * Compares two strings at the word level using the Levenshtein algorithm on word arrays.
 * Returns detailed information about which words match, differ, are missing, or are extra.
 *
 * @param original - The original string to compare against
 * @param recalled - The recalled string to evaluate
 * @returns An array of WordComparison objects describing each word's status
 *
 * @example
 * ```typescript
 * wordLevelComparison('the quick fox', 'the slow fox');
 * // Returns:
 * // [
 * //   { word: 'the', status: 'correct' },
 * //   { word: 'slow', status: 'incorrect', expected: 'quick' },
 * //   { word: 'fox', status: 'correct' }
 * // ]
 * ```
 */
export function wordLevelComparison(original: string, recalled: string): WordComparison[] {
  const originalWords = normalizeString(original).split(' ').filter(w => w.length > 0);
  const recalledWords = normalizeString(recalled).split(' ').filter(w => w.length > 0);

  // Handle empty inputs
  if (originalWords.length === 0 && recalledWords.length === 0) {
    return [];
  }

  if (originalWords.length === 0) {
    return recalledWords.map(word => ({ word, status: 'extra' as const }));
  }

  if (recalledWords.length === 0) {
    return originalWords.map(word => ({ word, status: 'missing' as const }));
  }

  // Use dynamic programming to find the optimal alignment
  const m = originalWords.length;
  const n = recalledWords.length;

  // Build the edit distance matrix
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first column (deletions from original = missing words)
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  // Initialize first row (insertions to recalled = extra words)
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = originalWords[i - 1] === recalledWords[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion (missing word)
        dp[i][j - 1] + 1,      // insertion (extra word)
        dp[i - 1][j - 1] + cost // match or substitution
      );
    }
  }

  // Backtrack to find the alignment
  const result: WordComparison[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalWords[i - 1] === recalledWords[j - 1]) {
      // Match - words are identical
      result.unshift({
        word: recalledWords[j - 1],
        status: 'correct'
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // Substitution - incorrect word
      result.unshift({
        word: recalledWords[j - 1],
        status: 'incorrect',
        expected: originalWords[i - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      // Insertion - extra word in recalled
      result.unshift({
        word: recalledWords[j - 1],
        status: 'extra'
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + 1)) {
      // Deletion - missing word from original
      result.unshift({
        word: originalWords[i - 1],
        status: 'missing'
      });
      i--;
    } else {
      // This should not happen with correct DP, but handle gracefully
      break;
    }
  }

  return result;
}
