/**
 * Word embeddings module for semantic validation.
 */

export { cosineSimilarity, normalizeVector } from './similarity';

export {
  loadEmbeddings,
  isLoaded,
  getWordVector,
  getCategoryCentroid,
  hasWord,
  getCategories,
} from './loader';

export type { EmbeddingIndex, CategoryCentroid } from './loader';

export {
  preloadEmbeddings,
  isReady,
  validateWordEmbedding,
  isValidWordEmbedding,
  isKnownWord,
} from './validator';

export type { ValidationResult } from './validator';
