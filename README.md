# Memory Gym

A mobile-first web application for cognitive training through memory and logic exercise modules. Gamify your daily mental exercises to improve working memory, verbal recall, and cognitive flexibility.

## Features

### Training Modules

| Module | Description | Skills Trained |
|--------|-------------|----------------|
| **Dual N-Back** | Match positions and audio sequences from N steps back | Working memory, pattern recognition |
| **Echo Chamber** | Recall sentences after a silence period | Verbal memory, attention |
| **Detail Hunter** | Remember visual details from images, then answer questions | Visual memory, observation |
| **Reverse Recall** | Trace your day backwards in time | Episodic memory, temporal ordering |
| **Sudoku** | Classic number puzzle with notes and highlighting | Logic, concentration, pattern recognition |
| **Semantic Chain** | Build word chains connecting related concepts | Semantic memory, vocabulary |
| **Mental Math Sprint** | Solve arithmetic chains under time pressure | Working memory, numerical processing |

### Gamification
- **XP & Leveling** - Earn experience points for each training session
- **Streaks** - Maintain daily training streaks
- **Achievements** - Unlock achievements as you progress

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (mobile-first)
- **State**: React Context + useReducer
- **Storage**: localStorage (no backend required)
- **APIs**: Unsplash (images), Claude/Gemini (vision analysis)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ronen/mem-gym.git
cd mem-gym

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env.local` file in the project root to enable dynamic image fetching for Detail Hunter:

```bash
# Unsplash API (for fetching images)
# Get your key at: https://unsplash.com/developers
VITE_UNSPLASH_KEY=your_unsplash_access_key

# Vision API - choose one (for analyzing images and generating questions)

# Option 1: Anthropic Claude Haiku
# Get your key at: https://console.anthropic.com/
VITE_ANTHROPIC_KEY=your_anthropic_api_key

# Option 2: Google Gemini Flash
# Get your key at: https://aistudio.google.com/apikey
VITE_GOOGLE_KEY=your_google_api_key
```

### API Key Behavior

| Keys Available | Behavior |
|----------------|----------|
| None | Uses pre-cached images from `src/data/detail-hunter-cache.json` |
| Unsplash only | Cannot fetch new images (vision API required for question generation) |
| Unsplash + Vision | Fetches fresh images, analyzes them, and caches results in localStorage |

## Populating the Image Cache

For users without API keys, the app uses pre-cached images stored in `src/data/detail-hunter-cache.json`. To add more images to this cache:

### Prerequisites
1. Set up your `.env.local` with both `VITE_UNSPLASH_KEY` and `VITE_ANTHROPIC_KEY`

### Running the Script

```bash
# Syntax: npm run populate-cache [category] [count]

# Fetch 5 nature images
npm run populate-cache nature 5

# Fetch 3 urban images
npm run populate-cache urban 3

# Fetch 10 animal images
npm run populate-cache animals 10
```

### Available Categories

| Category | Search Query |
|----------|--------------|
| `nature` | nature landscape |
| `urban` | city street urban |
| `people` | people portrait crowd |
| `food` | food cooking meal |
| `animals` | animals wildlife pets |
| `architecture` | architecture building interior |
| `travel` | travel destination landmark |

You can also use any custom category - it will be passed directly to Unsplash as a search query.

### What the Script Does

1. Fetches images from Unsplash API
2. Analyzes each image with Claude Haiku to generate:
   - 8-12 descriptive tags (objects, colors, counts, locations, actions)
   - 8 multiple-choice questions about visual details
3. Saves results to `src/data/detail-hunter-cache.json`
4. Skips images that are already cached

After running the script, commit the updated cache file to include the new images in the build.

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build (TypeScript + Vite)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Test UI with Vitest UI
npm run test:e2e     # Playwright E2E tests

# Utilities
npm run populate-cache [category] [count]  # Add images to static cache
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
│   ├── dashboard/       # Home screen
│   ├── pages/           # Route pages
│   └── gamification/    # XP, streaks, achievements
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
│   ├── imageService.ts      # Unsplash API wrapper
│   ├── visionService.ts     # Claude/Gemini vision analysis
│   ├── detailHunterCache.ts # Image caching logic
│   ├── scoring.ts           # XP and level calculations
│   └── storage.ts           # localStorage helpers
├── types/               # TypeScript interfaces
├── data/                # Static data files
│   └── detail-hunter-cache.json  # Pre-cached images
├── App.tsx
└── main.tsx

scripts/
└── populate-cache.ts    # CLI tool for populating image cache
```

## How Detail Hunter Works

1. **Setup**: Choose category, viewing time (10-30s), and delay before questions
2. **Viewing Phase**: Study the image for the selected duration
3. **Quiz Phase**: Answer 8 multiple-choice questions about details in the image
4. **Results**: See your score and which questions you got right/wrong

### Image Sources

- **With API keys**: Fresh images fetched from Unsplash, analyzed in real-time
- **Without API keys**: Pre-cached images from the static cache file

### Caching Strategy

When API keys are configured:
1. App fetches a fresh image from Unsplash
2. Vision API analyzes the image and generates questions
3. Results are cached in localStorage for offline use
4. Falls back to static cache if API calls fail

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers are the primary target (mobile-first design).

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint && npm run typecheck`
5. Submit a pull request
