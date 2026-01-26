/**
 * Semantic word validator using word embeddings.
 * Validates if a word belongs to a category based on cosine similarity.
 */

import {
  loadEmbeddings,
  isLoaded,
  getWordVector,
  getCategoryCentroid,
  hasWord,
} from './loader';
import { cosineSimilarity } from './similarity';

export interface ValidationResult {
  valid: boolean;
  reason: 'valid' | 'unknown_word' | 'low_similarity' | 'not_loaded';
  similarity?: number;
  threshold?: number;
}

/**
 * Pre-load embeddings. Call this when entering the Semantic Chain module
 * to avoid delay on first word submission.
 */
export async function preloadEmbeddings(): Promise<void> {
  await loadEmbeddings();
}

/**
 * Check if embeddings are ready for validation.
 */
export function isReady(): boolean {
  return isLoaded();
}

/**
 * Validate if a word belongs to a category using embedding similarity.
 *
 * @param word - The word to validate
 * @param category - The category to check against
 * @returns ValidationResult with validity and reason
 */
export function validateWordEmbedding(
  word: string,
  category: string
): ValidationResult {
  if (!isLoaded()) {
    return { valid: false, reason: 'not_loaded' };
  }

  const normalizedWord = word.toLowerCase().trim();

  // Check if word exists in vocabulary
  if (!hasWord(normalizedWord)) {
    return { valid: false, reason: 'unknown_word' };
  }

  // Get word vector
  const wordVector = getWordVector(normalizedWord);
  if (!wordVector) {
    return { valid: false, reason: 'unknown_word' };
  }

  // Get category centroid
  const categoryData = getCategoryCentroid(category);
  if (!categoryData) {
    // Unknown category - fall back to invalid
    console.warn(`Unknown category: ${category}`);
    return { valid: false, reason: 'low_similarity', similarity: 0, threshold: 0 };
  }

  // Calculate similarity
  const similarity = cosineSimilarity(
    Array.from(wordVector),
    categoryData.centroid
  );

  const isValid = similarity >= categoryData.threshold;

  return {
    valid: isValid,
    reason: isValid ? 'valid' : 'low_similarity',
    similarity,
    threshold: categoryData.threshold,
  };
}

/**
 * Simple boolean check for word validity.
 * Returns false if embeddings not loaded or word doesn't match category.
 */
export function isValidWordEmbedding(word: string, category: string): boolean {
  const result = validateWordEmbedding(word, category);
  return result.valid;
}

/**
 * Check if a word exists in the vocabulary (regardless of category).
 */
export function isKnownWord(word: string): boolean {
  if (!isLoaded()) return false;
  return hasWord(word.toLowerCase().trim());
}
