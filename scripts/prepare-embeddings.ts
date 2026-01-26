/**
 * Script to prepare word embeddings for semantic word validation.
 *
 * Downloads GloVe 50d embeddings, prunes to top 50k words,
 * quantizes to int8, computes category centroids, and outputs
 * binary files for the web app.
 *
 * Usage: npx tsx scripts/prepare-embeddings.ts
 *
 * Output files (in public/embeddings/):
 *   - vocab.txt: One word per line
 *   - vectors.bin: Int8 quantized vectors (50 dims per word)
 *   - centroids.json: Category centroids and thresholds
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as https from 'https';
import * as zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/embeddings');
const GLOVE_URL = 'https://nlp.stanford.edu/data/glove.6B.zip';
const GLOVE_FILE = 'glove.6B.50d.txt';
const TEMP_DIR = path.join(__dirname, '../.embeddings-temp');
const MAX_WORDS = 50000;
const VECTOR_DIM = 50;

// Seed words for each category - these define the category "centroid"
const CATEGORY_SEEDS: Record<string, string[]> = {
  animals: [
    'dog', 'cat', 'elephant', 'tiger', 'lion', 'bird', 'fish', 'whale', 'snake', 'bear',
    'horse', 'cow', 'pig', 'sheep', 'goat', 'deer', 'wolf', 'fox', 'rabbit', 'mouse',
    'eagle', 'hawk', 'owl', 'dolphin', 'shark', 'turtle', 'frog', 'monkey', 'gorilla', 'zebra',
  ],
  foods: [
    'bread', 'cheese', 'meat', 'fish', 'rice', 'pasta', 'pizza', 'salad', 'soup', 'sandwich',
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'chicken', 'beef', 'pork', 'egg', 'milk',
    'butter', 'sugar', 'salt', 'pepper', 'garlic', 'onion', 'tomato', 'potato', 'carrot', 'lettuce',
  ],
  countries: [
    'america', 'china', 'india', 'japan', 'germany', 'france', 'brazil', 'russia', 'canada', 'australia',
    'mexico', 'spain', 'italy', 'korea', 'england', 'egypt', 'turkey', 'argentina', 'poland', 'sweden',
    'norway', 'denmark', 'netherlands', 'belgium', 'switzerland', 'portugal', 'greece', 'ireland', 'scotland', 'wales',
  ],
  colors: [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
    'gray', 'gold', 'silver', 'bronze', 'crimson', 'scarlet', 'azure', 'navy', 'teal', 'cyan',
    'magenta', 'violet', 'indigo', 'maroon', 'olive', 'beige', 'tan', 'coral', 'salmon', 'turquoise',
  ],
  occupations: [
    'doctor', 'teacher', 'engineer', 'lawyer', 'nurse', 'chef', 'artist', 'writer', 'scientist', 'programmer',
    'manager', 'accountant', 'architect', 'pilot', 'farmer', 'mechanic', 'electrician', 'plumber', 'carpenter', 'painter',
    'musician', 'actor', 'director', 'journalist', 'photographer', 'designer', 'surgeon', 'dentist', 'therapist', 'professor',
  ],
  science: [
    'atom', 'molecule', 'cell', 'gene', 'electron', 'proton', 'neutron', 'gravity', 'energy', 'force',
    'mass', 'velocity', 'acceleration', 'evolution', 'species', 'organism', 'bacteria', 'virus', 'protein', 'dna',
    'quantum', 'relativity', 'entropy', 'photon', 'wavelength', 'frequency', 'radiation', 'magnetism', 'electricity', 'chemistry',
  ],
  psychology: [
    'emotion', 'behavior', 'cognition', 'memory', 'perception', 'attention', 'learning', 'motivation', 'personality', 'intelligence',
    'anxiety', 'depression', 'stress', 'therapy', 'consciousness', 'subconscious', 'instinct', 'reflex', 'habit', 'addiction',
    'trauma', 'phobia', 'disorder', 'syndrome', 'neurosis', 'psychosis', 'empathy', 'sympathy', 'intuition', 'reasoning',
  ],
  technology: [
    'computer', 'software', 'hardware', 'algorithm', 'database', 'network', 'server', 'internet', 'website', 'application',
    'programming', 'code', 'data', 'digital', 'processor', 'memory', 'storage', 'bandwidth', 'protocol', 'encryption',
    'artificial', 'intelligence', 'machine', 'learning', 'robot', 'automation', 'cloud', 'virtual', 'cyber', 'blockchain',
  ],
};

// Default thresholds per category (can be tuned)
const DEFAULT_THRESHOLDS: Record<string, number> = {
  animals: 0.45,
  foods: 0.42,
  countries: 0.50,
  colors: 0.48,
  occupations: 0.40,
  science: 0.38,
  psychology: 0.35,
  technology: 0.38,
};

interface WordVector {
  word: string;
  vector: Float32Array;
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location!, destPath).then(resolve).catch(reject);
        return;
      }

      const total = parseInt(response.headers['content-length'] || '0', 10);
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total > 0) {
          const pct = ((downloaded / total) * 100).toFixed(1);
          process.stdout.write(`\rDownloading: ${pct}%`);
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        console.log('\nDownload complete');
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function extractGloveFromZip(zipPath: string, outputPath: string): Promise<void> {
  // For simplicity, we'll ask user to manually extract or use a pre-extracted file
  // Node.js doesn't have built-in zip support
  console.log(`\nPlease manually extract ${GLOVE_FILE} from the zip to: ${outputPath}`);
  console.log(`Or download directly from: https://nlp.stanford.edu/data/glove.6B.zip`);
  console.log(`\nOnce extracted, run this script again.`);
  process.exit(0);
}

function parseGloveFile(filePath: string): WordVector[] {
  console.log(`\nParsing GloVe file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  const vectors: WordVector[] = [];
  let count = 0;

  for (const line of lines) {
    if (count >= MAX_WORDS) break;

    const parts = line.split(' ');
    const word = parts[0].toLowerCase();

    // Skip words with non-alphabetic characters
    if (!/^[a-z]+$/.test(word)) continue;

    // Skip very short words
    if (word.length < 2) continue;

    const values = parts.slice(1).map(parseFloat);
    if (values.length !== VECTOR_DIM) continue;

    vectors.push({
      word,
      vector: new Float32Array(values),
    });

    count++;
    if (count % 10000 === 0) {
      console.log(`  Parsed ${count} words...`);
    }
  }

  console.log(`  Total: ${vectors.length} words`);
  return vectors;
}

function normalizeVector(vec: Float32Array): Float32Array {
  let magnitude = 0;
  for (let i = 0; i < vec.length; i++) {
    magnitude += vec[i] * vec[i];
  }
  magnitude = Math.sqrt(magnitude);

  const normalized = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    normalized[i] = vec[i] / magnitude;
  }
  return normalized;
}

function quantizeToInt8(vec: Float32Array): Int8Array {
  // Normalize first, then scale to int8 range (-127 to 127)
  const normalized = normalizeVector(vec);
  const quantized = new Int8Array(vec.length);

  for (let i = 0; i < normalized.length; i++) {
    // Clamp to [-1, 1] and scale to [-127, 127]
    const clamped = Math.max(-1, Math.min(1, normalized[i]));
    quantized[i] = Math.round(clamped * 127);
  }

  return quantized;
}

function computeCentroid(
  seedWords: string[],
  wordIndex: Map<string, Float32Array>
): Float32Array {
  const centroid = new Float32Array(VECTOR_DIM);
  let count = 0;

  for (const word of seedWords) {
    const vec = wordIndex.get(word.toLowerCase());
    if (vec) {
      for (let i = 0; i < VECTOR_DIM; i++) {
        centroid[i] += vec[i];
      }
      count++;
    }
  }

  if (count > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      centroid[i] /= count;
    }
  }

  return normalizeVector(centroid);
}

function cosineSimilarity(a: Float32Array | Int8Array, b: Float32Array | Int8Array): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check for GloVe file
  const gloveFilePath = path.join(TEMP_DIR, GLOVE_FILE);

  if (!fs.existsSync(gloveFilePath)) {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    console.log('GloVe file not found.');
    console.log(`Please download glove.6B.zip from: ${GLOVE_URL}`);
    console.log(`Extract ${GLOVE_FILE} to: ${gloveFilePath}`);
    console.log('\nAlternatively, you can download just the 50d file (~70MB) from:');
    console.log('https://nlp.stanford.edu/data/glove.6B.zip');
    process.exit(1);
  }

  // Parse GloVe file
  const vectors = parseGloveFile(gloveFilePath);

  // Build word index for centroid computation
  const wordIndex = new Map<string, Float32Array>();
  for (const { word, vector } of vectors) {
    wordIndex.set(word, vector);
  }

  // Write vocab.txt
  console.log('\nWriting vocab.txt...');
  const vocabPath = path.join(OUTPUT_DIR, 'vocab.txt');
  const vocab = vectors.map((v) => v.word).join('\n');
  fs.writeFileSync(vocabPath, vocab);
  console.log(`  Written ${vectors.length} words`);

  // Write vectors.bin (quantized int8)
  console.log('\nWriting vectors.bin...');
  const vectorsPath = path.join(OUTPUT_DIR, 'vectors.bin');
  const totalBytes = vectors.length * VECTOR_DIM;
  const buffer = new Int8Array(totalBytes);

  for (let i = 0; i < vectors.length; i++) {
    const quantized = quantizeToInt8(vectors[i].vector);
    buffer.set(quantized, i * VECTOR_DIM);
  }

  fs.writeFileSync(vectorsPath, Buffer.from(buffer.buffer));
  console.log(`  Written ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  // Compute and write centroids
  console.log('\nComputing category centroids...');
  const centroids: Record<string, { centroid: number[]; threshold: number; seedCount: number }> = {};

  for (const [category, seeds] of Object.entries(CATEGORY_SEEDS)) {
    const centroid = computeCentroid(seeds, wordIndex);
    const foundSeeds = seeds.filter((s) => wordIndex.has(s.toLowerCase())).length;

    centroids[category] = {
      centroid: Array.from(centroid),
      threshold: DEFAULT_THRESHOLDS[category] || 0.4,
      seedCount: foundSeeds,
    };

    console.log(`  ${category}: ${foundSeeds}/${seeds.length} seed words found`);

    // Test a few words for this category
    const testWords = seeds.slice(0, 3);
    for (const word of testWords) {
      const vec = wordIndex.get(word.toLowerCase());
      if (vec) {
        const sim = cosineSimilarity(normalizeVector(vec), centroid);
        console.log(`    "${word}" similarity: ${sim.toFixed(3)}`);
      }
    }
  }

  const centroidsPath = path.join(OUTPUT_DIR, 'centroids.json');
  fs.writeFileSync(centroidsPath, JSON.stringify(centroids, null, 2));
  console.log(`\nWritten centroids.json`);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Vocabulary size: ${vectors.length} words`);
  console.log(`Vector dimensions: ${VECTOR_DIM}`);
  console.log(`Categories: ${Object.keys(centroids).length}`);

  const vocabSize = fs.statSync(vocabPath).size;
  const vectorsSize = fs.statSync(vectorsPath).size;
  const centroidsSize = fs.statSync(centroidsPath).size;
  const totalSize = vocabSize + vectorsSize + centroidsSize;

  console.log(`\nFile sizes:`);
  console.log(`  vocab.txt: ${(vocabSize / 1024).toFixed(1)} KB`);
  console.log(`  vectors.bin: ${(vectorsSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  centroids.json: ${(centroidsSize / 1024).toFixed(1)} KB`);
  console.log(`  Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
