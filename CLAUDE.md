# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memory Gym is a mobile-first web application for cognitive training through memory exercise modules. The app gamifies daily mental exercises to improve working memory, verbal recall, and cognitive flexibility.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (mobile-first)
- **State**: React Context + useReducer
- **Storage**: localStorage (no backend)
- **Audio**: Web Speech API (TTS/STT)
- **Notifications**: Browser Notification API

## Communication Principles

1. **Say "I don't know" when needed** - It's a valid answer. The human developer can help figure it out or find resources. Don't guess or make assumptions about unfamiliar APIs, libraries, or domain-specific logic.

2. **Ask for clarification** - When specs are unclear, ask more questions. Aim for 10/10 clarity before implementing. It's better to ask upfront than to build the wrong thing.

3. **Fail fast, avoid fallbacks** - Don't silently swallow errors or add defensive fallbacks that hide problems. Let errors surface early so they can be fixed properly.

## Code Quality

1. **Avoid code duplication** - Extract shared logic into reusable functions/components. DRY (Don't Repeat Yourself).

2. **Keep modularity** - Small, focused functions and components. Single responsibility principle.

3. **Don't over-engineer** - Only build what's needed now. Avoid speculative features or abstractions for hypothetical future requirements.

## Quick Commands

```bash
# Development
npm run dev          # Start dev server (default: http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

# Testing
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Test UI
npm run test:e2e     # Playwright E2E tests
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI (Button, Card, Timer, Modal)
│   ├── layout/          # AppShell, BottomNav, Header
│   ├── modules/         # Training modules
│   │   ├── dual-n-back/
│   │   ├── echo-chamber/
│   │   ├── detail-hunter/
│   │   ├── reverse-recall/
│   │   ├── sudoku/
│   │   ├── semantic-chain/
│   │   └── mental-math-sprint/
│   ├── dashboard/       # Home screen components
│   └── gamification/    # XP, streaks, achievements
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── utils/               # Pure utility functions
├── types/               # TypeScript interfaces
├── data/                # Static data (sentences, achievements)
├── App.tsx
└── main.tsx
```

## Architecture Decisions

### State Management
- **Global state** (GameContext): User progress, XP, streaks, settings
- **Module state**: Each module manages its own session state locally, persists completed sessions to localStorage
- **No Redux/Zustand**: App is simple enough for Context + useReducer

### Data Persistence
- All data in localStorage under `memory_gym_*` keys
- Include version field for migrations
- Keep last 100 sessions per module max
- Use IndexDB for browser storage

### Routing
- Use React Router v6
- Routes: `/`, `/train/:module`, `/stats`, `/settings`
- Bottom nav always visible except during active game sessions

## Coding Conventions

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- Use interfaces over types for objects
- No `any` - use `unknown` if truly needed

### Components
```tsx
// Use function declarations, not arrow functions for components
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks at top
  // derived state
  // handlers
  // effects
  // return JSX
}

// Props interface above component
interface ComponentNameProps {
  prop1: string;
  prop2: number;
}
```

### Hooks
- Prefix with `use`
- One hook per file in `/hooks`
- Return objects, not arrays (except for simple two-value returns)

### Styling
- Tailwind only - no CSS files
- Mobile-first: base styles are mobile, use `md:` and `lg:` for larger
- Use CSS variables for theme colors (defined in `index.css`)
- Minimum touch target: 44px (`min-h-11 min-w-11`)

### File Naming
- Components: PascalCase (`GameGrid.tsx`)
- Hooks: camelCase (`useTimer.ts`)
- Utils: camelCase (`levenshtein.ts`)
- Types: `index.ts` in `/types` folder

## Module Implementation Notes

### Dual N-Back (Priority 1)
- Most complex, implement first
- Trial timing: 2500ms total (500ms stimulus, 2000ms response)
- Grid is 3x3, positions 0-8
- Letters: A-L excluding I (similar to 1)
- N progression: >80% both → up, <50% either → down
- Generate ~30% position matches, ~30% audio matches independently

### Echo Chamber
- Sentence bank in `/data/sentences.json`
- Difficulty affects: word count, silence duration, sentence complexity
- Levenshtein for scoring - normalize to 0-100
- Support both typing and speech input (speech is optional/progressive enhancement)

### Detail Hunter
- Unsplash API for images (needs env var `VITE_UNSPLASH_KEY`)
- Fallback to bundled images in `/public/images/detail-hunter/`
- 1-hour delay default (configurable: 30m, 1h, 2h)
- Fuzzy match user details against original

### Reverse Recall
- Three levels: 3 events, 5 events, full with sensory
- Build timeline visually bottom-to-top (reverse)
- Heatmap uses date string keys: `YYYY-MM-DD`

## Adding a New Game Module

When adding a new game module, follow this checklist:

### 1. Types (`src/types/index.ts`)

- [ ] Add `ModuleNameStats` interface
- [ ] Add `ModuleNameSession` interface
- [ ] Add any difficulty/operation types needed
- [ ] Add to `ModuleStats` interface
- [ ] Add to `ModuleType` union

### 2. Game Context (`src/context/GameContext.tsx`)

- [ ] Add default stats to `defaultProgress.moduleStats`
- [ ] Add action type: `UPDATE_MODULE_NAME_STATS`
- [ ] Add reducer case (follow existing pattern)
- [ ] Add `updateModuleNameStats` method to context value
- [ ] Export in `GameContextValue` interface

### 3. Scoring (`src/utils/scoring.ts`)

- [ ] Add entry to `MODULE_XP_REWARDS` with `sessionComplete`, `perfectSession`, `accuracyBonus`, and optionally `difficultyMultiplier`

### 4. Achievements

- [ ] Update `src/utils/achievementChecker.ts`:
  - Add to `totalSessions` sum
  - Add to `averageAccuracy` array (if applicable)
  - Add to `all-modules` check
  - Add module-specific achievement checks
- [ ] Add module-specific achievements to `src/data/achievements.ts`

### 5. Components (`src/components/modules/module-name/`)

- [ ] `ModuleName.tsx` - Main component managing phase flow
- [ ] `GameSetup.tsx` - Difficulty/settings selection
- [ ] `SessionResults.tsx` - Results display with XP breakdown
- [ ] `useModuleName.ts` - Core game logic hook
- [ ] UI components as needed (timers, displays, inputs)

### 6. Integration

- [ ] Add to `src/components/pages/TrainModule.tsx` (import and moduleComponents map)
- [ ] Add card to `src/components/dashboard/Dashboard.tsx` (import icon, add to modules array)
- [ ] Add icon to `src/components/icons/index.tsx` if needed

### 7. Styling

- [ ] Add color to `tailwind.config.js` (with DEFAULT, light, dark variants)
- [ ] Add CSS variables to `src/index.css` (light and dark mode)

### 8. Documentation

- [ ] Update README.md modules table

## Key Utilities to Implement

### Levenshtein Distance (`/utils/levenshtein.ts`)
```typescript
export function levenshteinDistance(a: string, b: string): number;
export function calculateSimilarity(original: string, recalled: string): number; // 0-100
export function wordLevelComparison(original: string, recalled: string): WordComparison[];
```

### Scoring (`/utils/scoring.ts`)
```typescript
export function calculateXP(module: string, session: SessionResult): number;
export function checkLevelUp(currentXP: number, newXP: number): LevelUpResult | null;
export function checkAchievements(progress: GameProgress, session: SessionResult): Achievement[];
```

### Storage (`/utils/storage.ts`)
```typescript
export function loadFromStorage<T>(key: string, defaultValue: T): T;
export function saveToStorage<T>(key: string, value: T): void;
export function migrateStorage(currentVersion: number): void;
```

## Common Patterns

### Timer Hook
```typescript
const { timeLeft, isRunning, start, pause, reset } = useTimer({
  initialTime: 15,
  onComplete: handleTimerEnd,
  autoStart: false,
});
```

### Game Session Pattern
```typescript
// Each module follows this pattern
type GamePhase = 'ready' | 'active' | 'review' | 'complete';

function useGameSession() {
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [session, setSession] = useState<Session | null>(null);
  
  const startSession = () => { /* ... */ };
  const endSession = () => { /* ... */ };
  const saveSession = () => { /* ... */ };
  
  return { phase, session, startSession, endSession };
}
```

### Modal Pattern
```typescript
<Modal isOpen={showResults} onClose={() => setShowResults(false)}>
  <ResultsScreen session={session} onContinue={handleContinue} />
</Modal>
```

## Testing Strategy

### Unit Tests (Vitest)
- All utility functions
- Scoring algorithms
- N-back trial generation
- Levenshtein calculations

## Performance Guidelines

- Lazy load module components with `React.lazy`
- Preload audio files for Dual N-Back on module entry
- Use `React.memo` for grid cells and list items
- Debounce input handlers (300ms)
- Limit stored sessions (100 per module)

## Accessibility Requirements

- All buttons have aria-labels
- Focus visible on all interactive elements
- Color not sole indicator (use icons)
- Respect `prefers-reduced-motion`
- Min contrast 4.5:1
- Support keyboard navigation in games

## Environment Variables

```bash
# .env.local
VITE_UNSPLASH_KEY=your_unsplash_access_key  # Optional, has fallback
```

## Known Limitations / TODO

- Web Speech API has inconsistent mobile support - include fallback UI
- Notifications require user permission and don't work in all browsers
- No cloud sync - data is device-local only
- PWA offline support is stretch goal

## Reference

Full specification with data models, algorithms, and UI guidelines: `memory-gym-spec.md`
