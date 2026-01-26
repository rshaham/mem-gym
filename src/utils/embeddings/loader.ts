/**
 * Lazy loader for word embeddings.
 * Fetches and parses embedding files on first use.
 */

const VECTOR_DIM = 50;

export interface CategoryCentroid {
  centroid: number[];
  threshold: number;
  seedCount: number;
}

export interface EmbeddingIndex {
  vocab: string[];
  wordToIndex: Map<string, number>;
  vectors: Int8Array;
  centroids: Record<string, CategoryCentroid>;
}

let embeddingIndex: EmbeddingIndex | null = null;
let loadPromise: Promise<EmbeddingIndex> | null = null;

/**
 * Check if embeddings are loaded.
 */
export function isLoaded(): boolean {
  return embeddingIndex !== null;
}

/**
 * Get the embedding index, throwing if not loaded.
 */
export function getIndex(): EmbeddingIndex {
  if (!embeddingIndex) {
    throw new Error('Embeddings not loaded. Call loadEmbeddings() first.');
  }
  return embeddingIndex;
}

/**
 * Load embeddings from the public directory.
 * Safe to call multiple times - will only load once.
 */
export async function loadEmbeddings(): Promise<EmbeddingIndex> {
  // Return cached index if already loaded
  if (embeddingIndex) {
    return embeddingIndex;
  }

  // Return existing promise if load is in progress
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading
  loadPromise = doLoad();

  try {
    embeddingIndex = await loadPromise;
    return embeddingIndex;
  } finally {
    loadPromise = null;
  }
}

async function doLoad(): Promise<EmbeddingIndex> {
  console.log('[Embeddings] Loading...');
  const startTime = performance.now();

  // Fetch all files in parallel
  const [vocabResponse, vectorsResponse, centroidsResponse] = await Promise.all([
    fetch('/embeddings/vocab.txt'),
    fetch('/embeddings/vectors.bin'),
    fetch('/embeddings/centroids.json'),
  ]);

  if (!vocabResponse.ok || !vectorsResponse.ok || !centroidsResponse.ok) {
    throw new Error('Failed to load embedding files');
  }

  // Parse vocab
  const vocabText = await vocabResponse.text();
  const vocab = vocabText.trim().split('\n');

  // Parse vectors
  const vectorsBuffer = await vectorsResponse.arrayBuffer();
  const vectors = new Int8Array(vectorsBuffer);

  // Validate vector size
  const expectedSize = vocab.length * VECTOR_DIM;
  if (vectors.length !== expectedSize) {
    throw new Error(
      `Vector size mismatch: expected ${expectedSize}, got ${vectors.length}`
    );
  }

  // Parse centroids
  const centroids = await centroidsResponse.json();

  // Build word-to-index map
  const wordToIndex = new Map<string, number>();
  for (let i = 0; i < vocab.length; i++) {
    wordToIndex.set(vocab[i].toLowerCase(), i);
  }

  const loadTime = performance.now() - startTime;
  console.log(
    `[Embeddings] Loaded ${vocab.length} words in ${loadTime.toFixed(0)}ms`
  );

  return {
    vocab,
    wordToIndex,
    vectors,
    centroids,
  };
}

/**
 * Get the vector for a word.
 * Returns null if word is not in vocabulary.
 */
export function getWordVector(word: string): Int8Array | null {
  const index = getIndex();
  const wordIndex = index.wordToIndex.get(word.toLowerCase());

  if (wordIndex === undefined) {
    return null;
  }

  const start = wordIndex * VECTOR_DIM;
  return index.vectors.slice(start, start + VECTOR_DIM);
}

/**
 * Get the centroid for a category.
 */
export function getCategoryCentroid(category: string): CategoryCentroid | null {
  const index = getIndex();
  return index.centroids[category] || null;
}

/**
 * Check if a word exists in the vocabulary.
 */
export function hasWord(word: string): boolean {
  if (!embeddingIndex) return false;
  return embeddingIndex.wordToIndex.has(word.toLowerCase());
}

/**
 * Get all available categories.
 */
export function getCategories(): string[] {
  const index = getIndex();
  return Object.keys(index.centroids);
}
