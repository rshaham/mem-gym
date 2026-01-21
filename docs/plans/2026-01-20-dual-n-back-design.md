# Dual N-Back Module Design

## Overview

Complete implementation of the Dual N-Back training module for Memory Gym. This is a working memory exercise where users track both position (visual) and letter (audio) sequences, identifying when the current stimulus matches what appeared N steps back.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Audio | Web Speech API only | Simpler, no bundled files, uses existing TTS settings |
| Session length | User chooses (15/20/25/30) | Flexibility without cluttering settings |
| N-level progression | Suggestion only | User confirms level changes, maintains agency |
| Response buttons | Bottom button bar | Thumb-friendly mobile, works on desktop |
| Feedback | Subtle press acknowledgment | Confirms input without revealing correctness |
| Grid between stimuli | Stays visible, highlight disappears | Clean, simple |

## Game Flow

### Ready Phase - Session Setup

When user taps "Start Training":
1. Display current N-level (e.g., "N=2")
2. Show trial count selector: 15 / 20 / 25 / 30 (default: 20)
3. "Begin" button starts session

### Active Phase - Trial Loop

Each trial follows a 2500ms cycle:

1. **Stimulus (500ms)**: Grid cell highlights + letter spoken via TTS
2. **Response window (2000ms)**: Highlight disappears, grid remains visible

Bottom bar shows two large buttons:
- Left: "Position"
- Right: "Sound"

Progress indicator at top: "Trial 8 of 20"

Buttons show subtle press animation when tapped. No correct/incorrect indication during play.

### Review Phase - Results

After all trials complete:
- Overall accuracy percentages (position %, sound %, combined %)
- Hits, misses, false alarms breakdown
- Level suggestion based on performance:
  - >80% both: "Ready for N+1?" with Yes/No
  - <50% either: "Try N-1?" with Yes/No
  - Otherwise: "Keep practicing at N"
- "Save & Exit" button persists session and returns to dashboard

## Trial Generation Algorithm

### Stimulus Sets

- **Positions**: 0-8 (3x3 grid, top-left to bottom-right)
- **Letters**: A, B, C, D, E, F, G, H, J, K, L (11 letters - excludes I)

### Match Generation

Generate trials sequentially, targeting ~30% matches for each type independently:

```
For each trial after the first N trials:
  1. Decide if position match (30% chance)
  2. Decide if audio match (30% chance)
  3. If position match: use position from N trials ago
     Else: pick random position (excluding N-back position)
  4. If audio match: use letter from N trials ago
     Else: pick random letter (excluding N-back letter)
```

### Edge Cases

- **First N trials**: Cannot have matches, generate randomly
- **Lure avoidance**: When not a match, actively exclude the N-back value

### Trial Data Structure

```typescript
interface DualNBackTrial {
  position: number;           // 0-8
  letter: string;
  positionMatch: boolean;
  audioMatch: boolean;
  userPositionResponse: boolean;
  userAudioResponse: boolean;
  responseTime: number | null; // ms from stimulus start
}
```

## Component Architecture

### File Structure

```
src/components/modules/dual-n-back/
├── DualNBack.tsx          # Main container, phase management
├── GameSetup.tsx          # Trial count selector, begin button
├── GameGrid.tsx           # 3x3 grid with highlight state
├── ResponseBar.tsx        # Bottom button bar (Position/Sound)
├── TrialProgress.tsx      # "Trial 8 of 20" indicator
├── SessionResults.tsx     # End-of-session stats + level suggestion
└── useDualNBack.ts        # Core game logic hook
```

### Component Responsibilities

**DualNBack.tsx** - Orchestrator
- Uses `useGameState<DualNBackSession>` for phase management
- Renders child based on phase (setup → active → results)

**useDualNBack.ts** - Game Engine
- Generates trials array on session start
- Manages current trial index
- Handles trial timing (500ms stimulus, 2000ms response)
- Records user responses with timestamps
- Calculates final scores

**GameGrid.tsx** - Pure display
- Receives `highlightedCell: number | null`
- Renders 3x3 grid, highlights active cell
- Uses `React.memo` for performance

**ResponseBar.tsx** - Input handler
- Two buttons fixed to bottom
- Calls `onPositionPress()` / `onSoundPress()`
- Shows subtle pressed state

## Scoring & Progression

### Response Classification

For each trial after first N:

| Was Match | User Pressed | Result |
|-----------|--------------|--------|
| Yes | Yes | Hit |
| Yes | No | Miss |
| No | No | Correct Rejection |
| No | Yes | False Alarm |

Calculated separately for Position and Sound.

### Accuracy Calculation

```
Position Accuracy = (positionHits + correctRejections) / totalScoredTrials
Sound Accuracy = (audioHits + correctRejections) / totalScoredTrials
Overall Accuracy = (positionAccuracy + soundAccuracy) / 2
```

Only trials after the first N are scored.

### N-Level Progression

After session ends:
- Position >80% AND Sound >80%: Suggest N+1
- Position <50% OR Sound <50%: Suggest N-1 (min N=1)
- Otherwise: Stay at current N

User confirms or declines the suggestion.

### XP Reward

```
baseXP = 10 * trialCount
accuracyBonus = floor(overallAccuracy * 50)
nLevelBonus = currentN * 20
totalXP = baseXP + accuracyBonus + nLevelBonus
```

## Audio Implementation

### Speech Synthesis

On component mount:
- Get voices via `speechSynthesis.getVoices()`
- Use `UserSettings.ttsVoice` if set
- Fall back to first English voice

### Speaking Letters

```typescript
function speakLetter(letter: string): void {
  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.voice = selectedVoice;
  utterance.rate = settings.ttsRate;
  utterance.pitch = 1;
  utterance.volume = settings.soundEnabled ? 1 : 0;
  speechSynthesis.speak(utterance);
}
```

### Edge Cases

- `soundEnabled` false: Skip TTS (visual-only mode)
- Speech synthesis unavailable: Warning toast, continue visual-only
- Session exit: Call `speechSynthesis.cancel()`

### Timing

TTS is async. The 500ms window is for visual highlight only. Audio may extend into response window - this is acceptable.

## Data Persistence

Session saved to localStorage on completion:
- Key: `memory_gym_dual_n_back_sessions`
- Keep last 100 sessions max
- Update `DualNBackStats` in `GameProgress`

## Accessibility

- Response buttons have aria-labels
- Grid cells announced for screen readers
- Focus visible on all interactive elements
- Minimum 44px touch targets
- Respect `prefers-reduced-motion` for animations
