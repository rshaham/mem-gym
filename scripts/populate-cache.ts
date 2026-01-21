/**
 * Script to fetch images from Unsplash, analyze with vision API,
 * and save to the static cache JSON file.
 *
 * Usage: npx tsx scripts/populate-cache.ts [category] [count]
 * Example: npx tsx scripts/populate-cache.ts nature 5
 *
 * Requires .env.local with:
 *   VITE_UNSPLASH_KEY=your_key
 *   VITE_ANTHROPIC_KEY=your_key
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNSPLASH_KEY = process.env.VITE_UNSPLASH_KEY;
const ANTHROPIC_KEY = process.env.VITE_ANTHROPIC_KEY;
const CACHE_FILE = path.join(__dirname, '../src/data/detail-hunter-cache.json');

interface CachedImage {
  unsplashId: string;
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
  category: string;
  tags: Array<{ category: string; value: string; confidence: number }>;
  questions: Array<{
    id: string;
    questionText: string;
    correctAnswer: string;
    options: string[];
    userAnswer: null;
    isCorrect: null;
  }>;
  cachedAt: number;
}

interface CacheFile {
  images: CachedImage[];
  categories: string[];
}

const CATEGORY_QUERIES: Record<string, string> = {
  nature: 'nature landscape',
  urban: 'city street urban',
  people: 'people portrait crowd',
  food: 'food cooking meal',
  animals: 'animals wildlife pets',
  architecture: 'architecture building interior',
  travel: 'travel destination landmark',
};

const ANALYSIS_PROMPT = `Analyze this image for a memory quiz game. I need you to identify details that would make good quiz questions.

Provide your response as valid JSON with this exact structure:
{
  "tags": [
    { "category": "object", "value": "description", "confidence": 0.9 },
    { "category": "color", "value": "description", "confidence": 0.85 }
  ],
  "questions": [
    {
      "id": "q1",
      "questionText": "What color was the main object?",
      "correctAnswer": "Red",
      "options": ["Red", "Blue", "Green", "Yellow"],
      "userAnswer": null,
      "isCorrect": null
    }
  ]
}

Requirements:
- Identify 8-12 tags across different categories (objects, colors, counts, locations, actions)
- Generate exactly 8 multiple choice questions based on observable details
- Each question must have exactly 4 plausible options
- The correct answer must be one of the options
- Questions should test specific visual details that require careful observation

Return ONLY the JSON, no other text.`;

async function fetchUnsplashImages(category: string, count: number) {
  const query = CATEGORY_QUERIES[category] || category;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;

  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map((photo: any) => ({
    unsplashId: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  }));
}

async function analyzeImage(imageUrl: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.content.find((c: any) => c.type === 'text')?.text;
  if (!text) throw new Error('No text response');

  // Parse JSON from response
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonText);
}

async function main() {
  const category = process.argv[2] || 'nature';
  const count = parseInt(process.argv[3] || '3', 10);

  if (!UNSPLASH_KEY || !ANTHROPIC_KEY) {
    console.error('Missing API keys in .env.local');
    console.error('Required: VITE_UNSPLASH_KEY, VITE_ANTHROPIC_KEY');
    process.exit(1);
  }

  console.log(`Fetching ${count} images for category: ${category}`);

  // Load existing cache
  let cache: CacheFile = { images: [], categories: [] };
  try {
    const existing = fs.readFileSync(CACHE_FILE, 'utf-8');
    cache = JSON.parse(existing);
  } catch {
    console.log('Creating new cache file');
  }

  // Fetch images from Unsplash
  const unsplashImages = await fetchUnsplashImages(category, count);
  console.log(`Got ${unsplashImages.length} images from Unsplash`);

  // Process each image
  for (const img of unsplashImages) {
    // Skip if already cached
    if (cache.images.some((c) => c.unsplashId === img.unsplashId)) {
      console.log(`Skipping ${img.unsplashId} (already cached)`);
      continue;
    }

    console.log(`Analyzing ${img.unsplashId}...`);
    try {
      const analysis = await analyzeImage(img.url);

      const cachedImage: CachedImage = {
        ...img,
        category,
        tags: analysis.tags || [],
        questions: analysis.questions || [],
        cachedAt: Date.now(),
      };

      cache.images.push(cachedImage);
      console.log(`  Added with ${cachedImage.questions.length} questions`);

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  Failed to analyze: ${err}`);
    }
  }

  // Update categories list
  const allCategories = new Set(cache.images.map((img) => img.category));
  cache.categories = Array.from(allCategories);

  // Save cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`\nSaved ${cache.images.length} images to ${CACHE_FILE}`);
}

main().catch(console.error);
