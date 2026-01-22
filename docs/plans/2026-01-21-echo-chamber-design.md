# Echo Chamber Module Design

## Overview

Echo Chamber is a verbal memory training module where users hear or read sentences, wait through a silence period, then recall the sentence from memory. Scoring uses Levenshtein distance to measure accuracy.

## Game Flow

1. **Setup** - User selects difficulty, mode (audio/visual), and session length
2. **Present** - Show text or play TTS based on selected mode
3. **Silence** - Visual countdown while sentence is hidden
4. **Recall** - User types what they remember (30s limit)
5. **Feedback** - Word-level comparison with score
6. **Repeat** - Next sentence until session complete
7. **Results** - Session summary with total accuracy and XP

## Configuration Options

### Difficulty Levels

| Level | Word Count | Silence Duration |
|-------|------------|------------------|
| Easy | 5-8 words | 3 seconds |
| Medium | 9-12 words | 5 seconds |
| Hard | 13-18 words | 8 seconds |
| Expert | 19-25 words | 12 seconds |

### Session Length
- 3 sentences (quick practice)
- 5 sentences (standard)
- 10 sentences (extended)

### Presentation Mode
- **Visual** - Display text on screen
- **Audio** - Read aloud via Web Speech API (TTS)

## Scoring System

### Levenshtein Similarity
- Normalize both strings (lowercase, trim, collapse whitespace)
- Calculate edit distance between original and recalled
- Convert to percentage: `100 * (1 - distance / max(len(a), len(b)))`

### Word-Level Feedback
Each word marked as:
- **Correct** (green) - Exact match
- **Incorrect** (red) - Wrong word in position
- **Missing** (gray strikethrough) - In original, not recalled
- **Extra** (orange) - Recalled but not in original

### XP Calculation
- Base XP: `score * difficulty_multiplier`
- Difficulty multipliers: Easy=1, Medium=1.5, Hard=2, Expert=3
- Speed bonus: +5 XP if recalled under 10 seconds
- Session XP = sum of all round XPs

## Data Structures

### Sentence Bank (`src/data/sentences.json`)
```typescript
interface SentenceBank {
  easy: string[];      // 50+ sentences, 5-8 words
  medium: string[];    // 50+ sentences, 9-12 words
  hard: string[];      // 50+ sentences, 13-18 words
  expert: string[];    // 50+ sentences, 19-25 words
}
```

### Session Types
```typescript
type EchoChamberDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
type EchoChamberMode = 'visual' | 'audio';

interface EchoChamberRound {
  sentence: string;
  recalledText: string;
  score: number;
  timeToRecall: number;
  wordComparison: WordComparison[];
}

interface EchoChamberSession {
  id: string;
  difficulty: EchoChamberDifficulty;
  mode: EchoChamberMode;
  sessionLength: number;
  rounds: EchoChamberRound[];
  totalScore: number;
  xpEarned: number;
  completedAt: number;
}

interface WordComparison {
  word: string;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
  expected?: string;
}
```

### Hook State
```typescript
type Phase = 'setup' | 'presenting' | 'silence' | 'recall' | 'feedback' | 'results';

interface UseEchoChamberReturn {
  phase: Phase;
  difficulty: EchoChamberDifficulty;
  mode: EchoChamberMode;
  sessionLength: number;
  currentRound: number;
  totalRounds: number;
  currentSentence: string;
  silenceTimeLeft: number;
  recallTimeLeft: number;
  rounds: EchoChamberRound[];
  startSession: (difficulty, mode, sessionLength) => void;
  submitRecall: (text: string) => void;
  nextRound: () => void;
  reset: () => void;
}
```

## Implementation Files

### Create
| File | Purpose |
|------|---------|
| `src/data/sentences.json` | Static sentence bank |
| `src/utils/levenshtein.ts` | Scoring algorithms |
| `src/utils/echoChamberService.ts` | Sentence fetching + optional AI |
| `src/components/modules/echo-chamber/useEchoChamber.ts` | Game state hook |
| `src/components/modules/echo-chamber/EchoChamber.tsx` | Main component |
| `src/components/modules/echo-chamber/GameSetup.tsx` | Settings selection |
| `src/components/modules/echo-chamber/SentencePresenter.tsx` | Text + TTS |
| `src/components/modules/echo-chamber/SilenceTimer.tsx` | Countdown |
| `src/components/modules/echo-chamber/RecallInput.tsx` | Text input |
| `src/components/modules/echo-chamber/RecallFeedback.tsx` | Word comparison |
| `src/components/modules/echo-chamber/SessionResults.tsx` | Final summary |

### Modify
- `src/types/index.ts` - Add Echo Chamber types
- `src/components/pages/TrainModule.tsx` - Add route

## TTS Integration

Use `window.speechSynthesis` for audio mode:
- Check availability with `'speechSynthesis' in window`
- Fall back to visual mode if unavailable
- Use default voice (future: voice selection in settings)

## AI Enhancement (Optional)

When `VITE_ANTHROPIC_KEY` or `VITE_GOOGLE_KEY` available:
- Generate fresh sentences matching difficulty criteria
- Cache generated sentences in localStorage
- Fall back to static bank if API fails

## Sentence Content Guidelines

Mix of sentence types across all difficulties:
- Factual statements ("The museum opens at nine on weekdays.")
- Narratives ("She walked through the garden, admiring the roses.")
- Technical descriptions ("The server processes requests in parallel.")
- Abstract concepts ("Patience often leads to better outcomes.")
- Include proper nouns and numbers for added challenge
