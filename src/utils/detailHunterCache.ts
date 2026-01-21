/**
 * Cache manager for Detail Hunter images
 * Combines static JSON cache with dynamically cached images in localStorage
 */

import type { CachedImage, QuizQuestion } from '../types';
import staticCache from '../data/detail-hunter-cache.json';
import { hasUnsplashKey, getRandomImage, type UnsplashImage } from './imageService';
import { hasVisionKey, analyzeImage } from './visionService';

const DYNAMIC_CACHE_KEY = 'memory_gym_detail_hunter_dynamic_cache';
const MAX_DYNAMIC_CACHE_SIZE = 50;

interface DynamicCache {
  images: CachedImage[];
  version: number;
}

/**
 * Get all static cached images
 */
function getStaticImages(): CachedImage[] {
  return (staticCache as { images: CachedImage[] }).images;
}

/**
 * Get dynamically cached images from localStorage
 */
function getDynamicCache(): DynamicCache {
  try {
    const stored = localStorage.getItem(DYNAMIC_CACHE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { images: [], version: 1 };
}

/**
 * Save dynamically cached images to localStorage
 */
function saveDynamicCache(cache: DynamicCache): void {
  try {
    // Trim cache if too large
    if (cache.images.length > MAX_DYNAMIC_CACHE_SIZE) {
      cache.images = cache.images.slice(-MAX_DYNAMIC_CACHE_SIZE);
    }
    localStorage.setItem(DYNAMIC_CACHE_KEY, JSON.stringify(cache));
    console.log('[DetailHunter] Saved dynamic cache with', cache.images.length, 'images');
  } catch (err) {
    console.error('[DetailHunter] Failed to save cache:', err);
  }
}

/**
 * Get all cached images (static + dynamic)
 */
export function getAllCachedImages(): CachedImage[] {
  const staticImages = getStaticImages();
  const dynamicCache = getDynamicCache();
  return [...staticImages, ...dynamicCache.images];
}

/**
 * Get available categories from cached images
 */
export function getCachedCategories(): string[] {
  const images = getAllCachedImages();
  const categories = new Set(images.map(img => img.category));
  categories.delete('all'); // Remove if exists to avoid duplicate
  return ['all', ...Array.from(categories)];
}

/**
 * Get a random cached image by category
 * Returns null if no images match
 */
export function getCachedImage(category: string): CachedImage | null {
  const images = getAllCachedImages();

  const filtered = category === 'all'
    ? images
    : images.filter(img => img.category === category);

  if (filtered.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Check if we have any cached images for a category
 */
export function hasCachedImages(category: string): boolean {
  const images = getAllCachedImages();
  if (category === 'all') {
    return images.length > 0;
  }
  return images.some(img => img.category === category);
}

/**
 * Add an image to the dynamic cache
 */
export function cacheImage(image: CachedImage): void {
  const cache = getDynamicCache();

  // Check if already cached (by unsplashId)
  const exists = cache.images.some(img => img.unsplashId === image.unsplashId);
  if (!exists) {
    cache.images.push(image);
    saveDynamicCache(cache);
    console.log('[DetailHunter] Cached new image:', image.unsplashId, 'category:', image.category);
  } else {
    console.log('[DetailHunter] Image already cached:', image.unsplashId);
  }
}

/**
 * Check if API keys are available for fetching new images
 */
export function hasApiKeys(): boolean {
  return hasUnsplashKey() && hasVisionKey();
}

/**
 * Check if only Unsplash key is available (no vision)
 */
export function hasUnsplashOnly(): boolean {
  return hasUnsplashKey() && !hasVisionKey();
}

/**
 * Fetch a new image from Unsplash and analyze with vision API
 * Caches the result before returning
 */
export async function fetchAndCacheImage(category: string): Promise<CachedImage> {
  if (!hasUnsplashKey()) {
    throw new Error('Unsplash API key not configured');
  }
  if (!hasVisionKey()) {
    throw new Error('Vision API key not configured');
  }

  // Fetch image from Unsplash
  console.log('[DetailHunter] Fetching image from Unsplash for category:', category);
  const unsplashImage: UnsplashImage = await getRandomImage(category);
  console.log('[DetailHunter] Got Unsplash image:', unsplashImage.unsplashId);

  // Analyze with vision API
  console.log('[DetailHunter] Analyzing image with vision API...');
  const analysis = await analyzeImage(unsplashImage.url);
  console.log('[DetailHunter] Analysis complete, got', analysis.questions.length, 'questions');

  // Create cached image
  const cachedImage: CachedImage = {
    unsplashId: unsplashImage.unsplashId,
    url: unsplashImage.url,
    thumbUrl: unsplashImage.thumbUrl,
    photographer: unsplashImage.photographer,
    photographerUrl: unsplashImage.photographerUrl,
    category,
    tags: analysis.tags,
    questions: analysis.questions,
    cachedAt: Date.now(),
  };

  // Save to cache
  cacheImage(cachedImage);

  return cachedImage;
}

/**
 * Get an image for a session - fetches fresh when API keys available, falls back to cache
 * @param category - Image category to fetch
 * @returns CachedImage or throws if unavailable
 */
export async function getImageForSession(category: string): Promise<CachedImage> {
  console.log('[DetailHunter] getImageForSession:', category, 'hasApiKeys:', hasApiKeys());

  // If we have API keys, fetch fresh image
  if (hasApiKeys()) {
    try {
      return await fetchAndCacheImage(category);
    } catch (error) {
      console.warn('[DetailHunter] Failed to fetch fresh image, falling back to cache:', error);
      // Fall through to cache
    }
  }

  // Fall back to cache
  const cached = getCachedImage(category);
  if (cached) {
    return cached;
  }

  // No cache and no API - error
  throw new Error(`No images available for category: ${category}`);
}

/**
 * Clone questions for a new session (reset user answers)
 */
export function cloneQuestionsForSession(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map(q => ({
    ...q,
    userAnswer: null,
    isCorrect: null,
  }));
}
