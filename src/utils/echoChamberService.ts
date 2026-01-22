/**
 * Echo Chamber sentence service.
 * Provides sentence fetching and difficulty configuration for the Echo Chamber module.
 */

import sentenceBank from '../data/sentences.json';
import type { EchoChamberDifficulty } from '../types';

// ============ TYPES ============

interface DifficultyConfig {
  silenceDuration: number; // seconds
}

// ============ CONSTANTS ============

const DIFFICULTY_CONFIG: Record<EchoChamberDifficulty, DifficultyConfig> = {
  easy: { silenceDuration: 3 },
  medium: { silenceDuration: 5 },
  hard: { silenceDuration: 8 },
  expert: { silenceDuration: 12 },
};

// Type for the sentence bank structure
type SentenceBank = Record<EchoChamberDifficulty, string[]>;

// ============ FUNCTIONS ============

/**
 * Gets a random sentence from the sentence bank for the specified difficulty.
 *
 * @param difficulty - The difficulty level to get a sentence for
 * @returns A random sentence string
 */
export function getRandomSentence(difficulty: EchoChamberDifficulty): string {
  const sentences = (sentenceBank as SentenceBank)[difficulty];

  if (!sentences || sentences.length === 0) {
    throw new Error(`No sentences available for difficulty: ${difficulty}`);
  }

  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
}

/**
 * Gets the silence duration in seconds for the specified difficulty.
 *
 * @param difficulty - The difficulty level
 * @returns The silence duration in seconds
 */
export function getSilenceDuration(difficulty: EchoChamberDifficulty): number {
  return DIFFICULTY_CONFIG[difficulty].silenceDuration;
}

/**
 * Gets an array of random sentences for a session.
 * Ensures no duplicate sentences within a session.
 *
 * @param difficulty - The difficulty level
 * @param count - The number of sentences to retrieve
 * @returns An array of unique sentence strings
 */
export function getSessionSentences(
  difficulty: EchoChamberDifficulty,
  count: number
): string[] {
  const sentences = (sentenceBank as SentenceBank)[difficulty];

  if (!sentences || sentences.length === 0) {
    throw new Error(`No sentences available for difficulty: ${difficulty}`);
  }

  if (count > sentences.length) {
    throw new Error(
      `Requested ${count} sentences but only ${sentences.length} available for difficulty: ${difficulty}`
    );
  }

  // Fisher-Yates shuffle to get random unique sentences
  const shuffled = [...sentences];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
