/**
 * Vision API service with BYOK support for Claude Haiku and Gemini Flash
 */

import type { QuizQuestion, ImageTag } from '../types';

export type VisionProvider = 'anthropic' | 'google' | null;

interface VisionAnalysisResult {
  tags: ImageTag[];
  questions: QuizQuestion[];
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'url';
      url: string;
    };
  }>;
}

interface AnthropicResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

function getAnthropicKey(): string | null {
  return import.meta.env.VITE_ANTHROPIC_KEY || null;
}

function getGoogleKey(): string | null {
  return import.meta.env.VITE_GOOGLE_KEY || null;
}

/**
 * Detect which vision provider is available
 */
export function getVisionProvider(): VisionProvider {
  if (getAnthropicKey()) return 'anthropic';
  if (getGoogleKey()) return 'google';
  return null;
}

export function hasVisionKey(): boolean {
  return getVisionProvider() !== null;
}

const ANALYSIS_PROMPT = `Analyze this image for a memory quiz game. I need you to identify details that would make good quiz questions.

Provide your response as valid JSON with this exact structure:
{
  "tags": [
    { "category": "object", "value": "description", "confidence": 0.9 },
    { "category": "color", "value": "description", "confidence": 0.85 },
    { "category": "count", "value": "description", "confidence": 0.8 },
    { "category": "location", "value": "description", "confidence": 0.75 },
    { "category": "action", "value": "description", "confidence": 0.7 }
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
- Distractors should be plausible but incorrect
- Categories: "object", "color", "count", "location", "action"

Focus on specific, observable details like:
- Colors of objects
- Number of items/people
- Positions and arrangements
- Specific objects visible
- Actions or states
- Weather, time of day hints
- Text or signs if visible

Return ONLY the JSON, no other text.`;

async function analyzeWithAnthropic(imageUrl: string): Promise<VisionAnalysisResult> {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const message: AnthropicMessage = {
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'url',
          url: imageUrl,
        },
      },
      {
        type: 'text',
        text: ANALYSIS_PROMPT,
      },
    ],
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [message],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data: AnthropicResponse = await response.json();
  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent?.text) {
    throw new Error('No text response from Anthropic');
  }

  return parseAnalysisResponse(textContent.text);
}

async function analyzeWithGemini(imageUrl: string): Promise<VisionAnalysisResult> {
  const apiKey = getGoogleKey();
  if (!apiKey) {
    throw new Error('Google API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: await fetchImageAsBase64(imageUrl),
                },
              },
              {
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No text response from Gemini');
  }

  return parseAnalysisResponse(text);
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function parseAnalysisResponse(text: string): VisionAnalysisResult {
  // Extract JSON from the response (may be wrapped in markdown code blocks)
  let jsonText = text.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(parsed.tags) || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response structure');
    }

    // Validate and clean tags
    const tags: ImageTag[] = parsed.tags.map((tag: Record<string, unknown>) => ({
      category: validateTagCategory(tag.category as string),
      value: String(tag.value || ''),
      confidence: Number(tag.confidence) || 0.5,
    })).filter((tag: ImageTag) => tag.value);

    // Validate and clean questions
    const questions: QuizQuestion[] = parsed.questions.map((q: Record<string, unknown>, index: number) => ({
      id: String(q.id || `q${index + 1}`),
      questionText: String(q.questionText || ''),
      correctAnswer: String(q.correctAnswer || ''),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      userAnswer: null,
      isCorrect: null,
    })).filter((q: QuizQuestion) =>
      q.questionText &&
      q.correctAnswer &&
      q.options.length === 4 &&
      q.options.includes(q.correctAnswer)
    );

    if (questions.length < 6) {
      throw new Error(`Not enough valid questions generated: ${questions.length}`);
    }

    return { tags, questions: questions.slice(0, 8) };
  } catch (e) {
    throw new Error(`Failed to parse vision API response: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

function validateTagCategory(category: string): ImageTag['category'] {
  const validCategories: ImageTag['category'][] = ['object', 'color', 'count', 'location', 'action'];
  if (validCategories.includes(category as ImageTag['category'])) {
    return category as ImageTag['category'];
  }
  return 'object'; // Default fallback
}

/**
 * Analyze an image using available vision API
 */
export async function analyzeImage(imageUrl: string): Promise<VisionAnalysisResult> {
  const provider = getVisionProvider();

  if (provider === 'anthropic') {
    return analyzeWithAnthropic(imageUrl);
  }

  if (provider === 'google') {
    return analyzeWithGemini(imageUrl);
  }

  throw new Error('No vision API key configured');
}
