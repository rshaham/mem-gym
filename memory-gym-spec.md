# Memory Gym - Technical Specification

## Overview

A mobile-first web application designed to improve working memory, verbal recall, and cognitive flexibility through four distinct training modules. Built as a single-page React application with local storage persistence.

---

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (mobile-first responsive)
- **State Management**: React Context + useReducer for global state
- **Persistence**: localStorage with JSON serialization
- **Audio**: Web Speech API (TTS/STT) for Echo Chamber
- **Notifications**: Notification API for delayed recalls
- **Build**: Vite

---

## Core Architecture

### Directory Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Timer.tsx
│   │   ├── Modal.tsx
│   │   └── ScoreDisplay.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── BottomNav.tsx
│   │   └── Header.tsx
│   ├── modules/
│   │   ├── detail-hunter/
│   │   │   ├── DetailHunter.tsx
│   │   │   ├── ImageDisplay.tsx
│   │   │   ├── DetailInput.tsx
│   │   │   └── RecallChallenge.tsx
│   │   ├── echo-chamber/
│   │   │   ├── EchoChamber.tsx
│   │   │   ├── SentencePlayer.tsx
│   │   │   ├── SilencePeriod.tsx
│   │   │   └── RecallInput.tsx
│   │   ├── reverse-recall/
│   │   │   ├── ReverseRecall.tsx
│   │   │   ├── EventChain.tsx
│   │   │   ├── JournalEntry.tsx
│   │   │   └── Heatmap.tsx
│   │   └── dual-n-back/
│   │       ├── DualNBack.tsx
│   │       ├── GameGrid.tsx
│   │       ├── AudioCue.tsx
│   │       ├── ControlPanel.tsx
│   │       └── ResultsScreen.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── DailyProgress.tsx
│   │   └── StatsOverview.tsx
│   └── gamification/
│       ├── XPBar.tsx
│       ├── StreakCounter.tsx
│       ├── AchievementBadge.tsx
│       └── LevelUpModal.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useTimer.ts
│   ├── useSpeechSynthesis.ts
│   ├── useSpeechRecognition.ts
│   ├── useNotifications.ts
│   └── useGameState.ts
├── context/
│   ├── GameContext.tsx
│   └── SettingsContext.tsx
├── utils/
│   ├── levenshtein.ts
│   ├── scoring.ts
│   ├── sentences.ts
│   ├── images.ts
│   └── storage.ts
├── types/
│   └── index.ts
├── data/
│   ├── sentences.json
│   └── achievements.json
├── App.tsx
└── main.tsx
```

---

## Data Models

### TypeScript Interfaces

```typescript
// types/index.ts

// ============ USER & PROGRESS ============

interface UserProfile {
  id: string;
  createdAt: number;
  settings: UserSettings;
}

interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  theme: 'light' | 'dark' | 'system';
  ttsVoice: string | null;
  ttsRate: number; // 0.5 - 2.0
}

interface GameProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string; // ISO date string YYYY-MM-DD
  achievements: string[]; // achievement IDs
  moduleStats: ModuleStats;
}

interface ModuleStats {
  detailHunter: DetailHunterStats;
  echoChamber: EchoChamberStats;
  reverseRecall: ReverseRecallStats;
  dualNBack: DualNBackStats;
}

// ============ DETAIL HUNTER ============

interface DetailHunterStats {
  totalSessions: number;
  totalRecalls: number;
  successfulRecalls: number;
  averageAccuracy: number;
  bestAccuracy: number;
}

interface DetailHunterSession {
  id: string;
  imageUrl: string;
  imageDescription: string; // for accessibility
  userDetails: string[]; // 4 details entered by user
  createdAt: number;
  recallScheduledAt: number; // 1 hour later
  recallCompletedAt: number | null;
  recalledDetails: string[] | null;
  score: number | null; // 0-100
  status: 'pending' | 'ready' | 'completed' | 'expired';
}

// ============ ECHO CHAMBER ============

interface EchoChamberStats {
  totalSessions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  wordsRecalled: number;
  currentDifficulty: EchoDifficulty;
}

type EchoDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface EchoChamberRound {
  id: string;
  sentence: string;
  wordCount: number;
  difficulty: EchoDifficulty;
  silenceDuration: number; // seconds
  userResponse: string;
  accuracy: number; // 0-100 (Levenshtein-based)
  timestamp: number;
}

interface EchoChamberSession {
  id: string;
  rounds: EchoChamberRound[];
  totalScore: number;
  averageAccuracy: number;
  startedAt: number;
  completedAt: number;
}

// ============ REVERSE RECALL ============

interface ReverseRecallStats {
  totalSessions: number;
  totalEventsLogged: number;
  longestChain: number;
  averageChainLength: number;
  calendarData: Record<string, number>; // date -> detail count for heatmap
}

interface ReverseRecallSession {
  id: string;
  date: string; // ISO date
  events: ReverseRecallEvent[];
  chainLevel: number; // 1, 2, or 3
  score: number;
  completedAt: number;
}

interface ReverseRecallEvent {
  id: string;
  description: string;
  sensoryDetails?: {
    sight?: string;
    sound?: string;
    smell?: string;
    touch?: string;
    taste?: string;
  };
  timestamp: number; // when event occurred (estimated)
  orderIndex: number; // position in reverse chain
}

// ============ DUAL N-BACK ============

interface DualNBackStats {
  totalSessions: number;
  totalTrials: number;
  highestN: number;
  averageAccuracy: number;
  positionAccuracy: number;
  audioAccuracy: number;
  currentN: number;
}

interface DualNBackSession {
  id: string;
  nLevel: number;
  trials: DualNBackTrial[];
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  overallAccuracy: number;
  startedAt: number;
  completedAt: number;
}

interface DualNBackTrial {
  position: number; // 0-8 for 3x3 grid
  letter: string;
  positionMatch: boolean;
  audioMatch: boolean;
  userPositionResponse: boolean;
  userAudioResponse: boolean;
  responseTime: number | null;
}

// ============ GAMIFICATION ============

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'volume' | 'milestone' | 'special';
  condition: AchievementCondition;
  xpReward: number;
  unlockedAt?: number;
}

interface AchievementCondition {
  type: 'streak' | 'totalXP' | 'level' | 'moduleSpecific' | 'combined';
  threshold: number;
  module?: string;
  stat?: string;
}

interface DailyChallenge {
  id: string;
  date: string;
  description: string;
  module: string;
  requirement: {
    type: 'sessions' | 'accuracy' | 'streak';
    target: number;
  };
  xpReward: number;
  completed: boolean;
}

// ============ NOTIFICATIONS ============

interface PendingNotification {
  id: string;
  type: 'detail_recall' | 'daily_reminder' | 'streak_warning';
  scheduledFor: number;
  data: Record<string, any>;
  sent: boolean;
}
```

---

## Module Specifications

### 1. Detail Hunter

#### Flow
1. **Image Display Phase** (15 seconds)
   - Fetch random high-quality image from Unsplash API (or use bundled fallback images)
   - Display full-screen with subtle countdown timer
   - Image categories: street scenes, office environments, nature with people, market scenes
   
2. **Detail Entry Phase**
   - Image hides
   - Four text inputs appear for user to enter observed details
   - Prompt: "What 4 specific details do you remember?"
   - Examples shown: "blue watch", "red umbrella", "man with glasses"
   - Submit locks details and schedules recall

3. **Waiting Period** (1 hour default, configurable: 30min, 1hr, 2hr)
   - Show pending recall card on dashboard
   - Browser notification when ready (if permitted)
   - Status indicator in app

4. **Recall Challenge Phase**
   - Present recall prompt without showing original image
   - User re-enters the 4 details from memory
   - Submit to see comparison

5. **Scoring & Review**
   - Side-by-side comparison of original vs recalled details
   - Fuzzy matching score using Levenshtein distance
   - Show original image for review
   - XP awarded based on accuracy

#### Scoring Algorithm
```typescript
function scoreDetailRecall(
  original: string[],
  recalled: string[]
): { score: number; matches: MatchResult[] } {
  // For each original detail, find best match in recalled
  // Use normalized Levenshtein similarity
  // Score = average of best matches * 100
  // Bonus for exact matches
}
```

#### Image Sources
- Primary: Unsplash API with curated collections
- Fallback: Bundled set of 50+ diverse images
- Categories to query: "street photography people", "office scene", "market crowd", "cafe interior"

---

### 2. Echo Chamber

#### Flow
1. **Sentence Generation**
   - Select sentence based on difficulty level
   - Easy: 5-8 words, simple structure
   - Medium: 9-12 words, compound sentences
   - Hard: 13-18 words, complex clauses
   - Expert: 19-25 words, technical or abstract content

2. **Playback Phase**
   - Text-to-Speech reads sentence aloud
   - Visual waveform animation during playback
   - Option to show/hide text (hide for harder mode)

3. **Silence Period** (difficulty-based)
   - Easy: 3 seconds
   - Medium: 5 seconds
   - Hard: 8 seconds
   - Expert: 12 seconds
   - Visual countdown with "processing" animation
   - User cannot interact during this phase

4. **Recall Phase**
   - Two input modes:
     a. **Type mode**: Text input with character limit
     b. **Speak mode**: Speech-to-text recording
   - Time limit: 30 seconds

5. **Scoring**
   - Levenshtein distance normalized to 0-100
   - Bonus points for speed
   - Word-level breakdown showing correct/incorrect

#### Sentence Bank Structure
```json
{
  "easy": [
    "The blue car turned left at the light.",
    "She ordered coffee with extra cream.",
    ...
  ],
  "medium": [
    "The quarterly report showed significant growth in the eastern region.",
    "After finishing dinner, they decided to walk through the park.",
    ...
  ],
  "hard": [
    "The committee unanimously agreed that the proposed amendments would require further discussion before implementation.",
    ...
  ],
  "expert": [
    "Despite the mounting evidence suggesting otherwise, the research team maintained their hypothesis that quantum entanglement could theoretically enable faster-than-light information transfer under specific laboratory conditions.",
    ...
  ]
}
```

Include 50+ sentences per difficulty level. Mix of:
- Factual statements
- Narratives
- Technical descriptions
- Abstract concepts
- Proper nouns and numbers

#### Levenshtein Implementation
```typescript
// utils/levenshtein.ts

export function levenshteinDistance(a: string, b: string): number {
  // Standard dynamic programming implementation
  // Return edit distance
}

export function calculateSimilarity(original: string, recalled: string): number {
  // Normalize both strings (lowercase, trim, collapse whitespace)
  // Calculate Levenshtein distance
  // Convert to percentage: 1 - (distance / max(len(a), len(b)))
  // Return 0-100 score
}

export function wordLevelComparison(
  original: string,
  recalled: string
): WordComparison[] {
  // Split into words
  // Align using longest common subsequence
  // Return array of { word, status: 'correct' | 'incorrect' | 'missing' | 'extra' }
}
```

---

### 3. Reverse Recall

#### Flow
1. **Level Selection**
   - Level 1: Recall last 3 events
   - Level 2: Recall last 5 events
   - Level 3: Full afternoon/morning with sensory details

2. **Guided Entry**
   - Start with "What's the last thing you did before opening this app?"
   - After each entry, prompt: "And before that?"
   - For Level 3, after base events: "Add sensory details to any event"

3. **Chain Building UI**
   - Vertical timeline, building upward (reverse chronological)
   - Each event is a card that can be expanded
   - Swipe or tap to add sensory detail badges

4. **Completion & Scoring**
   - Points for each event logged
   - Bonus for sensory details
   - Bonus for longer chains
   - Data saved to calendar heatmap

5. **Heatmap Visualization**
   - Calendar view showing past 30/90 days
   - Color intensity = number of details logged that day
   - Tap day to see that day's log

#### Scoring
```typescript
const POINTS = {
  baseEvent: 10,
  sensoryDetail: 5,
  chainBonus: (length: number) => length * 2,
  consistencyBonus: (daysInRow: number) => daysInRow * 10
};
```

---

### 4. Dual N-Back

This is the most complex module. Implementation must be precise for the exercise to be effective.

#### Game Mechanics
- 3x3 grid displayed on screen
- Each trial (2.5 seconds):
  1. A square highlights in one of 9 positions
  2. A letter is spoken aloud (A-L, excluding similar sounds)
  3. User must indicate if POSITION matches N trials back
  4. User must indicate if LETTER matches N trials back

#### Trial Timing
```
Trial duration: 2500ms
├── Stimulus display: 500ms (square highlight + audio)
├── Response window: 2000ms (user can press buttons)
└── Inter-trial interval: 500ms (brief pause)
```

#### N-Level Progression
- Start at N=1 (easiest)
- After session:
  - If accuracy > 80% for both position AND audio → increase N
  - If accuracy < 50% for either → decrease N (minimum 1)
  - Otherwise → stay at same N
- Maximum N = 9 (though N > 4 is very difficult)

#### Session Structure
- 20 trials + N initial trials (no matching possible for first N)
- For N=2: 22 total trials
- ~30% of trials have position match
- ~30% of trials have audio match
- These can overlap (dual match)

#### Match Generation Algorithm
```typescript
function generateTrials(n: number, trialCount: number): DualNBackTrial[] {
  const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];
  
  const trials: DualNBackTrial[] = [];
  
  // Generate first N trials (no matches possible)
  for (let i = 0; i < n; i++) {
    trials.push({
      position: randomFrom(positions),
      letter: randomFrom(letters),
      positionMatch: false,
      audioMatch: false,
      // ... other fields
    });
  }
  
  // Generate remaining trials with controlled match probability
  for (let i = n; i < trialCount + n; i++) {
    const shouldMatchPosition = Math.random() < 0.3;
    const shouldMatchAudio = Math.random() < 0.3;
    
    const position = shouldMatchPosition 
      ? trials[i - n].position 
      : randomFromExcluding(positions, trials[i - n].position);
    
    const letter = shouldMatchAudio
      ? trials[i - n].letter
      : randomFromExcluding(letters, trials[i - n].letter);
    
    trials.push({
      position,
      letter,
      positionMatch: shouldMatchPosition,
      audioMatch: shouldMatchAudio,
      // ...
    });
  }
  
  return trials;
}
```

#### UI Components

**GameGrid.tsx**
- 3x3 CSS Grid
- Each cell is a square that can be highlighted
- Highlight animation: scale up slightly + color change
- Touch-friendly sizing (minimum 80px cells on mobile)

**ControlPanel.tsx**
- Two large buttons at bottom of screen:
  - "Position Match" (left, blue)
  - "Sound Match" (right, green)
- Buttons show feedback on press (correct = flash green, incorrect = flash red)
- Can be pressed simultaneously
- Haptic feedback on mobile if enabled

**AudioCue.tsx**
- Uses Web Speech API for TTS
- Fallback: pre-recorded audio files for each letter
- Ensure consistent voice across session

**ResultsScreen.tsx**
- Show accuracy breakdown:
  - Position: X/Y correct (Z%)
  - Audio: X/Y correct (Z%)
  - Combined: X%
- Show hits, misses, false alarms for each type
- Recommendation: "Great job! Moving to N=3" or "Let's practice more at N=2"

---

## Gamification System

### XP & Levels

```typescript
const XP_TABLE = {
  // XP required to reach each level
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 850,
  6: 1300,
  7: 1900,
  8: 2650,
  9: 3550,
  10: 4600,
  // ... continues with increasing gaps
};

const XP_REWARDS = {
  detailHunter: {
    sessionComplete: 20,
    perfectRecall: 50,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 10),
  },
  echoChamber: {
    roundComplete: 10,
    perfectRound: 30,
    sessionComplete: 25,
    difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2, expert: 3 },
  },
  reverseRecall: {
    eventLogged: 5,
    sensoryDetail: 3,
    chainComplete: 15,
    level3Complete: 40,
  },
  dualNBack: {
    sessionComplete: 30,
    perfectSession: 100,
    nLevelUp: 50,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 5),
  },
};
```

### Streak System

```typescript
interface StreakTracker {
  currentStreak: number;
  lastPlayedDate: string | null;
  
  checkStreak(today: string): void {
    if (!this.lastPlayedDate) {
      this.currentStreak = 1;
    } else if (isYesterday(this.lastPlayedDate, today)) {
      this.currentStreak++;
    } else if (!isSameDay(this.lastPlayedDate, today)) {
      this.currentStreak = 1; // Reset
    }
    this.lastPlayedDate = today;
  }
}
```

### Achievements

```json
[
  {
    "id": "first_session",
    "name": "Brain Gym Member",
    "description": "Complete your first training session",
    "icon": "🧠",
    "category": "milestone",
    "xpReward": 50
  },
  {
    "id": "streak_7",
    "name": "Week Warrior",
    "description": "Maintain a 7-day streak",
    "icon": "🔥",
    "category": "streak",
    "xpReward": 100
  },
  {
    "id": "streak_30",
    "name": "Monthly Master",
    "description": "Maintain a 30-day streak",
    "icon": "🏆",
    "category": "streak",
    "xpReward": 500
  },
  {
    "id": "dual_n3",
    "name": "Triple Threat",
    "description": "Reach N=3 in Dual N-Back",
    "icon": "🎯",
    "category": "milestone",
    "xpReward": 150
  },
  {
    "id": "dual_n5",
    "name": "Memory Athlete",
    "description": "Reach N=5 in Dual N-Back",
    "icon": "🥇",
    "category": "milestone",
    "xpReward": 500
  },
  {
    "id": "echo_perfect_10",
    "name": "Perfect Echo",
    "description": "Get 100% accuracy on 10 Echo Chamber rounds",
    "icon": "🔊",
    "category": "accuracy",
    "xpReward": 200
  },
  {
    "id": "detail_perfect",
    "name": "Photographic Memory",
    "description": "Get 100% accuracy on a Detail Hunter recall",
    "icon": "📸",
    "category": "accuracy",
    "xpReward": 150
  },
  {
    "id": "reverse_level3",
    "name": "Time Traveler",
    "description": "Complete a Level 3 Reverse Recall with all sensory details",
    "icon": "⏪",
    "category": "milestone",
    "xpReward": 100
  },
  {
    "id": "all_modules_day",
    "name": "Full Workout",
    "description": "Complete all 4 modules in a single day",
    "icon": "💪",
    "category": "special",
    "xpReward": 100
  },
  {
    "id": "xp_1000",
    "name": "Dedicated Learner",
    "description": "Earn 1,000 total XP",
    "icon": "📚",
    "category": "volume",
    "xpReward": 0
  },
  {
    "id": "xp_10000",
    "name": "Memory Master",
    "description": "Earn 10,000 total XP",
    "icon": "👑",
    "category": "volume",
    "xpReward": 0
  }
]
```

---

## UI/UX Guidelines

### Mobile-First Responsive Design

```css
/* Breakpoints */
--mobile: 320px - 480px (primary target)
--tablet: 481px - 768px
--desktop: 769px+

/* Touch targets */
--min-touch-target: 44px
--comfortable-touch-target: 56px

/* Spacing scale */
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
```

### Navigation

- **Bottom navigation bar** (mobile) with 4 items:
  - Home/Dashboard
  - Train (opens module selector)
  - Stats
  - Settings
  
- **Desktop**: Side navigation or top bar

### Color Scheme

```css
/* Light theme */
--bg-primary: #FFFFFF
--bg-secondary: #F5F5F7
--text-primary: #1D1D1F
--text-secondary: #86868B
--accent-primary: #007AFF (iOS blue)
--accent-success: #34C759
--accent-warning: #FF9500
--accent-error: #FF3B30

/* Module colors */
--detail-hunter: #5856D6 (purple)
--echo-chamber: #FF9500 (orange)
--reverse-recall: #34C759 (green)
--dual-n-back: #007AFF (blue)

/* Dark theme */
--bg-primary: #000000
--bg-secondary: #1C1C1E
--text-primary: #FFFFFF
--text-secondary: #8E8E93
/* Accents remain similar but slightly adjusted for contrast */
```

### Component Patterns

**Cards**
- Rounded corners (12px)
- Subtle shadow on light theme
- Subtle border on dark theme
- Touch feedback (scale down slightly on press)

**Buttons**
- Primary: Filled with accent color
- Secondary: Outlined
- Large: Full width, 56px height
- Disabled: 50% opacity

**Modals**
- Slide up from bottom on mobile
- Center on desktop
- Backdrop blur effect
- Swipe down to dismiss

**Loading States**
- Skeleton screens for data loading
- Spinner for actions
- Progress bars for timed activities

### Animations

```typescript
// Use Framer Motion or CSS transitions

const transitions = {
  fast: '150ms ease-out',
  normal: '250ms ease-out',
  slow: '350ms ease-out',
};

// Key animations
// - Page transitions: slide left/right
// - Modal: slide up + fade
// - Cards: scale on press
// - Success: confetti burst
// - Level up: celebration animation
// - Streak: fire animation
```

### Accessibility

- All interactive elements have visible focus states
- Color is never the only indicator (use icons, patterns)
- Minimum contrast ratio: 4.5:1 for text
- Screen reader labels for all buttons
- Reduced motion option respects `prefers-reduced-motion`
- Font scaling support (rem units)

---

## Local Storage Schema

```typescript
// Storage keys and structure

const STORAGE_KEYS = {
  USER_PROFILE: 'memory_gym_user',
  GAME_PROGRESS: 'memory_gym_progress',
  DETAIL_HUNTER_SESSIONS: 'memory_gym_dh_sessions',
  ECHO_CHAMBER_SESSIONS: 'memory_gym_ec_sessions',
  REVERSE_RECALL_SESSIONS: 'memory_gym_rr_sessions',
  DUAL_NBACK_SESSIONS: 'memory_gym_dnb_sessions',
  PENDING_NOTIFICATIONS: 'memory_gym_notifications',
  SETTINGS: 'memory_gym_settings',
};

// Utility hook
function useLocalStorage<T>(key: string, initialValue: T) {
  // Standard implementation with JSON parse/stringify
  // Include error handling for corrupted data
  // Include migration logic for schema changes
}
```

### Data Migration

Include version field in stored data:

```typescript
interface StoredData<T> {
  version: number;
  data: T;
  lastModified: number;
}

function migrateData<T>(stored: StoredData<T>, migrations: Migration[]): T {
  // Apply migrations sequentially
}
```

---

## API Integrations

### Unsplash API (Detail Hunter)

```typescript
// Get random image with specific parameters
const UNSPLASH_ACCESS_KEY = process.env.VITE_UNSPLASH_KEY;

async function getRandomImage(): Promise<ImageData> {
  const collections = '894527,4626860,317099'; // Curated collections
  const url = `https://api.unsplash.com/photos/random?collections=${collections}&orientation=landscape`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });
  
  const data = await response.json();
  
  return {
    url: data.urls.regular,
    description: data.alt_description || 'Scene with multiple details',
    credit: {
      name: data.user.name,
      link: data.user.links.html,
    },
  };
}
```

**Fallback**: Bundle 50+ images in `/public/images/detail-hunter/` for offline use or API limits.

### Web Speech API

```typescript
// hooks/useSpeechSynthesis.ts

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  
  useEffect(() => {
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      // Filter for English voices
      setVoices(available.filter(v => v.lang.startsWith('en')));
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);
  
  const speak = (text: string, rate = 1) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    // Set voice from settings or use default
    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  };
  
  return { speak, speaking, voices };
}

// hooks/useSpeechRecognition.ts

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        setTranscript(result[0].transcript);
      };
      
      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);
  
  const startListening = () => {
    recognitionRef.current?.start();
    setListening(true);
  };
  
  const stopListening = () => {
    recognitionRef.current?.stop();
  };
  
  return { transcript, listening, startListening, stopListening, supported: !!recognitionRef.current };
}
```

### Notifications API

```typescript
// hooks/useNotifications.ts

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  
  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };
  
  const scheduleNotification = (
    id: string,
    title: string,
    body: string,
    scheduledTime: number
  ) => {
    const delay = scheduledTime - Date.now();
    if (delay <= 0) return;
    
    // Store in localStorage for persistence
    const pending = getPendingNotifications();
    pending.push({ id, title, body, scheduledTime });
    savePendingNotifications(pending);
    
    // Set timeout (won't survive page close, but localStorage backup will)
    setTimeout(() => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
        removePendingNotification(id);
      }
    }, delay);
  };
  
  // On app load, check for any due notifications
  const checkPendingNotifications = () => {
    const pending = getPendingNotifications();
    const now = Date.now();
    
    pending.forEach(notification => {
      if (notification.scheduledTime <= now && permission === 'granted') {
        new Notification(notification.title, { 
          body: notification.body,
          icon: '/icon.png'
        });
        removePendingNotification(notification.id);
      }
    });
  };
  
  return { permission, requestPermission, scheduleNotification, checkPendingNotifications };
}
```

---

## Testing Requirements

### Unit Tests
- Levenshtein distance function
- Scoring algorithms
- XP calculations
- Streak logic
- N-back trial generation
- Match detection

### Component Tests
- Each module's main component
- Form inputs and validation
- Timer functionality
- Audio playback/recording

### E2E Tests
- Complete flow for each module
- Gamification (XP gain, level up, achievements)
- Settings persistence
- Notification scheduling

---

## Performance Considerations

1. **Image Loading**
   - Use `loading="lazy"` for images not in viewport
   - Preload next image while user is viewing current
   - Use appropriate image sizes (srcset)

2. **Audio**
   - Preload letter audio files for Dual N-Back
   - Use Audio API with preload for instant playback

3. **Storage**
   - Limit session history (keep last 100 per module)
   - Compress old data or archive to IndexedDB if needed

4. **Rendering**
   - Use `React.memo` for expensive components
   - Virtualize long lists (session history)
   - Debounce input handlers

---

## PWA Configuration

```json
// manifest.json
{
  "name": "Memory Gym",
  "short_name": "MemoryGym",
  "description": "Train your working memory with daily exercises",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Service worker for offline support of:
- Static assets
- Bundled images (fallback)
- Cached session data

---

## Implementation Priority

### Phase 1: Core Infrastructure
1. Project setup (Vite + React + TypeScript + Tailwind)
2. App shell (navigation, layout, routing)
3. Local storage hooks and context
4. Basic gamification (XP, levels, streaks)

### Phase 2: Dual N-Back Module
1. Game grid component
2. Trial generation logic
3. Audio playback
4. Input handling and scoring
5. Results screen
6. Stats tracking

### Phase 3: Echo Chamber Module
1. Sentence bank
2. TTS integration
3. Silence timer
4. Text input mode
5. Speech recognition mode
6. Levenshtein scoring
7. Word-level comparison display

### Phase 4: Detail Hunter Module
1. Image fetching (Unsplash + fallback)
2. Display timer
3. Detail entry form
4. Notification scheduling
5. Recall challenge
6. Scoring and comparison

### Phase 5: Reverse Recall Module
1. Event entry UI
2. Chain mechanics
3. Sensory detail additions
4. Calendar heatmap
5. History viewing

### Phase 6: Polish
1. Achievements system
2. Daily challenges
3. Settings page
4. Onboarding flow
5. PWA setup
6. Dark mode
7. Animations and transitions

---

## Notes for Implementation

1. **Start with Dual N-Back** - It's the most scientifically validated and self-contained. Good foundation test.

2. **Mobile-first always** - Test on actual mobile devices early and often. The app should feel native.

3. **Offline-first** - Assume network may be unavailable. Only Unsplash images require network.

4. **Feedback is crucial** - Every action should have immediate visual/audio/haptic feedback.

5. **Keep sessions short** - Each module session should be completable in 2-5 minutes.

6. **Celebrate progress** - Make XP gains, level ups, and achievements feel rewarding.

7. **Respect user time** - No unnecessary loading screens or transitions.
