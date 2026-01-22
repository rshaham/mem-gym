/**
 * Levenshtein distance utilities for the Echo Chamber module.
 * Provides string comparison functions for measuring recall accuracy.
 */

// ============ NUMBER PARSING ============

/**
 * Base number words mapped to their numeric values.
 */
const BASE_NUMBERS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
  'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
  'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
  'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
  'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  'eighty': 80, 'ninety': 90,
};

/**
 * Multiplier words for compound numbers.
 */
const MULTIPLIERS: Record<string, number> = {
  'hundred': 100,
  'thousand': 1000,
  'million': 1000000,
  'billion': 1000000000,
};

/**
 * Parses compound number words into a numeric value.
 * Handles patterns like "three hundred fifty two" → 352
 *
 * @param words - Array of words to parse
 * @returns Object with numeric value and count of words consumed, or null if not a number
 */
function parseNumberWords(words: string[]): { value: number; wordsConsumed: number } | null {
  if (words.length === 0) return null;

  const firstWord = words[0].toLowerCase();

  // Check if starts with a digit (already a number)
  if (/^\d+$/.test(firstWord)) {
    return { value: parseInt(firstWord, 10), wordsConsumed: 1 };
  }

  // Check if first word is a number word
  if (!(firstWord in BASE_NUMBERS) && !(firstWord in MULTIPLIERS)) {
    return null;
  }

  let total = 0;
  let current = 0;
  let wordsConsumed = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();

    if (word in BASE_NUMBERS) {
      current += BASE_NUMBERS[word];
      wordsConsumed = i + 1;
    } else if (word in MULTIPLIERS) {
      const multiplier = MULTIPLIERS[word];
      if (current === 0) current = 1; // "hundred" alone means 100
      if (multiplier >= 1000) {
        // thousand, million, billion: add to total and reset
        total += current * multiplier;
        current = 0;
      } else {
        // hundred: multiply current
        current *= multiplier;
      }
      wordsConsumed = i + 1;
    } else {
      // Not a number word, stop parsing
      break;
    }
  }

  total += current;

  if (wordsConsumed === 0) return null;
  return { value: total, wordsConsumed };
}

/**
 * Normalizes a word by stripping all punctuation and converting to lowercase.
 *
 * @param word - The word to normalize
 * @returns The normalized word
 */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\w]/g, '');
}

/**
 * Checks if two words match with tolerance for 1-character typos.
 * Also handles number word equivalence (e.g., "three" matches "3").
 *
 * @param word1 - First word
 * @param word2 - Second word
 * @returns True if words match within tolerance
 */
function wordsMatch(word1: string, word2: string): boolean {
  const n1 = normalizeWord(word1);
  const n2 = normalizeWord(word2);

  if (n1 === n2) return true;

  // Check if both are single number words that match
  const num1 = BASE_NUMBERS[n1];
  const num2 = BASE_NUMBERS[n2];
  if (num1 !== undefined && num2 !== undefined && num1 === num2) return true;

  // Check if one is a digit and the other is a number word
  if (/^\d+$/.test(n1) && num2 !== undefined && parseInt(n1, 10) === num2) return true;
  if (/^\d+$/.test(n2) && num1 !== undefined && parseInt(n2, 10) === num1) return true;

  // Allow 1-character typo tolerance
  const distance = levenshteinDistance(n1, n2);
  return distance <= 1;
}

/**
 * Collapses number word sequences in an array into digit strings.
 * E.g., ["three", "hundred", "fifty", "two"] → ["352"]
 *
 * @param words - Array of words
 * @returns Array with number sequences collapsed to digit strings
 */
function collapseNumberWords(words: string[]): string[] {
  const result: string[] = [];
  let i = 0;

  while (i < words.length) {
    const parsed = parseNumberWords(words.slice(i));
    if (parsed && parsed.wordsConsumed > 0) {
      result.push(String(parsed.value));
      i += parsed.wordsConsumed;
    } else {
      result.push(words[i]);
      i++;
    }
  }

  return result;
}

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
  // Pre-process: split, normalize, and collapse number sequences
  const rawOriginalWords = normalizeString(original).split(' ').filter(w => w.length > 0);
  const rawRecalledWords = normalizeString(recalled).split(' ').filter(w => w.length > 0);

  const originalWords = collapseNumberWords(rawOriginalWords);
  const recalledWords = collapseNumberWords(rawRecalledWords);

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

  // Build the edit distance matrix using fuzzy matching
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

  // Fill the matrix using wordsMatch for fuzzy comparison
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = wordsMatch(originalWords[i - 1], recalledWords[j - 1]) ? 0 : 1;
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
    if (i > 0 && j > 0 && wordsMatch(originalWords[i - 1], recalledWords[j - 1])) {
      // Match - words are equivalent (exact or within tolerance)
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
