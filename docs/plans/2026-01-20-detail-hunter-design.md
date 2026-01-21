# Detail Hunter Module Design

## Overview & Flow

**Purpose:** Visual memory training through image recall with delayed testing.

**Core Flow:**
1. **Setup** - User selects category, viewing time, and delay
2. **View Phase** - Image displayed with countdown timer
3. **Waiting Phase** - Delay period (instant to 2 hours)
4. **Quiz Phase** - Multiple choice questions about image details
5. **Results** - Score breakdown and XP earned

**User Options:**
- Category/theme selection (nature, urban, people, etc.)
- Viewing time: 10s, 15s, 20s, 30s
- Delay: Instant, 30 min, 1 hour, 2 hours

**Quiz Format:** Multiple choice (4 options per question), 6-8 questions per session.

**Future:** Hard mode with free-text answers.

---

## Technical Architecture

### Image Service (Unsplash)
- Use Unsplash API with `VITE_UNSPLASH_KEY` environment variable
- Search by category/theme using `/search/photos` endpoint
- Free tier: 50 requests/hour (demo), 5000/hour (production)
- Store image URLs, photographer attribution, and Unsplash IDs

### Vision Service (BYOK)
- Support two providers: Claude Haiku (`VITE_ANTHROPIC_KEY`) or Gemini Flash (`VITE_GOOGLE_KEY`)
- Simple abstraction layer that detects which key is available
- Request format: Send image URL, receive structured tags
- Tags include: objects, colors, locations, actions, counts, relationships

### Caching Strategy
- Cache file: `src/data/detail-hunter-cache.json`
- Structure: `{ [unsplashId]: { url, tags, distractors, lastUpdated } }`
- Priority: Check cache first → If miss and has API key, fetch and cache → If no key and no cache, show error
- Developers with keys can run a script to populate cache, then commit

### Quiz Generation
- For each cached tag, generate 3-4 plausible distractors
- Distractors generated during vision API call (ask model to include them)
- Example: Tag "red car" → Distractors: "blue car", "red truck", "green car"
- Store 6-8 question/answer sets per image

### Notification Service
- For delayed recall, use Browser Notification API
- Fallback: In-app notification when user returns
- Store pending sessions in localStorage with scheduled time

---

## Data Structures

```typescript
// Types for Detail Hunter module

interface DetailHunterSession {
  id: string;
  imageId: string;           // Unsplash ID
  imageUrl: string;
  category: string;
  viewingTime: number;       // seconds (10, 15, 20, 30)
  delayMinutes: number;      // 0, 30, 60, 120
  viewedAt: number;          // timestamp when image was shown
  quizStartedAt: number;     // timestamp when quiz began
  questions: QuizQuestion[];
  score: number;             // 0-100
  xpEarned: number;
}

interface QuizQuestion {
  id: string;
  questionText: string;      // "What color was the car?"
  correctAnswer: string;     // "Red"
  options: string[];         // ["Red", "Blue", "Green", "Yellow"]
  userAnswer: string | null;
  isCorrect: boolean | null;
}

interface CachedImage {
  unsplashId: string;
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
  category: string;
  tags: ImageTag[];
  questions: QuizQuestion[]; // Pre-generated with distractors
  cachedAt: number;
}

interface ImageTag {
  category: 'object' | 'color' | 'count' | 'location' | 'action';
  value: string;             // "red car", "3 people", "beach"
  confidence: number;        // 0-1 from vision API
}

// Module stats (extends existing GameProgress)
interface DetailHunterStats {
  totalSessions: number;
  totalRecalls: number;
  successfulRecalls: number;
  averageAccuracy: number;
  bestAccuracy: number;
}
```

---

## Component Structure

```
src/components/modules/detail-hunter/
├── DetailHunter.tsx        # Main orchestrator (phase management)
├── GameSetup.tsx           # Category, viewing time, delay selection
├── ImageViewer.tsx         # Shows image with countdown timer
├── WaitingScreen.tsx       # Delay countdown or "ready to quiz" prompt
├── QuizScreen.tsx          # Multiple choice questions
├── QuizQuestion.tsx        # Single question with 4 options
├── SessionResults.tsx      # Score breakdown, XP earned
└── useDetailHunter.ts      # Session state management hook
```

**Component Responsibilities:**

- **DetailHunter**: Manages phases (setup → viewing → waiting → quiz → results), coordinates with GameContext for XP/stats
- **GameSetup**: Category picker (grid of themes), viewing time selector (10/15/20/30s), delay selector (instant/30m/1h/2h)
- **ImageViewer**: Full-screen image display, circular countdown timer overlay, photographer attribution
- **WaitingScreen**: If instant → skip. Otherwise shows countdown or "Come back in X" message. Listens for notification click to resume
- **QuizScreen**: Renders 6-8 questions sequentially, tracks answers, calculates score
- **QuizQuestion**: Single MC question with 4 tappable options, highlights correct/incorrect after selection
- **SessionResults**: Shows score percentage, question breakdown, XP earned, play again button

**Services (in `/utils/`):**
- `imageService.ts` - Unsplash API wrapper
- `visionService.ts` - BYOK Claude/Gemini abstraction
- `detailHunterCache.ts` - Read/write to cache file

---

## Scoring & XP Calculation

### Quiz Scoring
- Score = (correct answers / total questions) × 100
- Each question is worth equal points
- No partial credit - answer is either right or wrong

### XP Formula

```typescript
function calculateDetailHunterXP(
  score: number,           // 0-100
  questionCount: number,   // typically 6-8
  delayMinutes: number,    // 0, 30, 60, 120
  viewingTime: number      // 10, 15, 20, 30 seconds
): number {
  // Base XP: 10 per question
  const baseXP = 10 * questionCount;

  // Accuracy bonus: up to 50 XP for perfect score
  const accuracyBonus = Math.floor((score / 100) * 50);

  // Delay bonus: reward longer delays (harder)
  // instant=0, 30min=10, 1hr=20, 2hr=40
  const delayBonus = delayMinutes === 0 ? 0
    : delayMinutes <= 30 ? 10
    : delayMinutes <= 60 ? 20
    : 40;

  // Shorter viewing time bonus (harder)
  // 30s=0, 20s=5, 15s=10, 10s=20
  const viewingBonus = viewingTime >= 30 ? 0
    : viewingTime >= 20 ? 5
    : viewingTime >= 15 ? 10
    : 20;

  return baseXP + accuracyBonus + delayBonus + viewingBonus;
}
```

### Example XP Breakdown
- 8 questions, 75% score, 1hr delay, 15s viewing
- Base: 80 + Accuracy: 37 + Delay: 20 + Viewing: 10 = **147 XP**

---

## Implementation Notes

### V1 Scope
- Multiple choice quiz only
- BYOK for vision API (Claude Haiku or Gemini Flash)
- Pre-cached images in repo for users without API keys
- Browser notifications for delayed recall

### Future Enhancements
- Hard mode: Free-text answers with fuzzy matching
- More categories
- Image generation (nano-banana/Google GenAI)
- Streak bonuses for consecutive correct answers
