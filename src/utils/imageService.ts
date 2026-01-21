/**
 * Unsplash API service for fetching images
 */

export interface UnsplashImage {
  unsplashId: string;
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
}

interface UnsplashApiPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface UnsplashSearchResponse {
  results: UnsplashApiPhoto[];
  total: number;
  total_pages: number;
}

const UNSPLASH_API_BASE = 'https://api.unsplash.com';

function getUnsplashKey(): string | null {
  return import.meta.env.VITE_UNSPLASH_KEY || null;
}

export function hasUnsplashKey(): boolean {
  return getUnsplashKey() !== null;
}

/**
 * Maps category names to Unsplash search queries
 */
const CATEGORY_QUERIES: Record<string, string> = {
  nature: 'nature landscape',
  urban: 'city street urban',
  people: 'people portrait crowd',
  food: 'food cooking meal',
  animals: 'animals wildlife pets',
  architecture: 'architecture building interior',
  travel: 'travel destination landmark',
  all: 'random',
};

function mapPhoto(photo: UnsplashApiPhoto): UnsplashImage {
  return {
    unsplashId: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  };
}

/**
 * Search for images by category
 */
export async function searchImages(
  category: string,
  count: number = 10
): Promise<UnsplashImage[]> {
  const apiKey = getUnsplashKey();
  if (!apiKey) {
    throw new Error('Unsplash API key not configured');
  }

  const query = CATEGORY_QUERIES[category] || category;
  const url = `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data: UnsplashSearchResponse = await response.json();
  return data.results.map(mapPhoto);
}

/**
 * Get a single random image by category
 */
export async function getRandomImage(category: string): Promise<UnsplashImage> {
  const apiKey = getUnsplashKey();
  if (!apiKey) {
    throw new Error('Unsplash API key not configured');
  }

  const query = CATEGORY_QUERIES[category] || category;
  const url = `${UNSPLASH_API_BASE}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const photo: UnsplashApiPhoto = await response.json();
  return mapPhoto(photo);
}

/**
 * Get available categories
 */
export function getCategories(): string[] {
  return Object.keys(CATEGORY_QUERIES).filter(k => k !== 'all');
}
