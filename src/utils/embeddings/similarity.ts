/**
 * Cosine similarity calculation for word embeddings.
 */

/**
 * Calculate cosine similarity between two vectors.
 * Works with both Float32Array and Int8Array.
 */
export function cosineSimilarity(
  a: Float32Array | Int8Array | number[],
  b: Float32Array | Int8Array | number[]
): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  return dot / magnitude;
}

/**
 * Normalize a vector to unit length.
 */
export function normalizeVector(vec: number[]): number[] {
  let magnitude = 0;
  for (let i = 0; i < vec.length; i++) {
    magnitude += vec[i] * vec[i];
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) return vec;

  return vec.map((v) => v / magnitude);
}
