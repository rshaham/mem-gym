// ============ USER & PROGRESS ============

export interface UserProfile {
  id: string;
  createdAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  theme: 'light' | 'dark' | 'system';
  ttsVoice: string | null;
  ttsRate: number; // 0.5 - 2.0
}

export interface GameProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // ISO date string YYYY-MM-DD
  achievements: string[]; // achievement IDs
  moduleStats: ModuleStats;
}

export interface ModuleStats {
  detailHunter: DetailHunterStats;
  echoChamber: EchoChamberStats;
  reverseRecall: ReverseRecallStats;
  dualNBack: DualNBackStats;
  sudoku: SudokuStats;
  semanticChain: SemanticChainStats;
  mentalMathSprint: MentalMathSprintStats;
}

// ============ DETAIL HUNTER ============

export interface DetailHunterStats {
  totalSessions: number;
  totalRecalls: number;
  successfulRecalls: number;
  averageAccuracy: number;
  bestAccuracy: number;
}

export interface DetailHunterSession {
  id: string;
  imageId: string;
  imageUrl: string;
  category: string;
  viewingTime: number;       // seconds (10, 15, 20, 30)
  delayMinutes: number;      // 0, 30, 60, 120
  viewedAt: number;
  quizStartedAt: number | null;
  questions: QuizQuestion[];
  score: number | null;      // 0-100
  xpEarned: number | null;
  status: 'viewing' | 'waiting' | 'ready' | 'quiz' | 'completed';
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  correctAnswer: string;
  options: string[];
  userAnswer: string | null;
  isCorrect: boolean | null;
}

export interface CachedImage {
  unsplashId: string;
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
  category: string;
  tags: ImageTag[];
  questions: QuizQuestion[];
  cachedAt: number;
}

export interface ImageTag {
  category: 'object' | 'color' | 'count' | 'location' | 'action';
  value: string;
  confidence: number;
}

// ============ ECHO CHAMBER ============

export type EchoChamberDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type EchoChamberMode = 'visual' | 'audio';

export interface EchoChamberStats {
  totalSessions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  wordsRecalled: number;
  currentDifficulty: EchoChamberDifficulty;
}

export interface WordComparison {
  word: string;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
  expected?: string;
}

export interface EchoChamberRound {
  sentence: string;
  recalledText: string;
  score: number;
  timeToRecall: number;
  wordComparison: WordComparison[];
}

export interface EchoChamberSession {
  id: string;
  difficulty: EchoChamberDifficulty;
  mode: EchoChamberMode;
  sessionLength: number;
  rounds: EchoChamberRound[];
  totalScore: number;
  xpEarned: number;
  completedAt: number;
}

// ============ REVERSE RECALL ============

export interface ReverseRecallStats {
  totalSessions: number;
  totalEventsLogged: number;
  longestChain: number;
  averageChainLength: number;
  calendarData: Record<string, number>;
}

export interface ReverseRecallSession {
  id: string;
  date: string;
  events: ReverseRecallEvent[];
  chainLevel: number;
  score: number;
  completedAt: number;
}

export interface ReverseRecallEvent {
  id: string;
  description: string;
  sensoryDetails?: {
    sight?: string;
    sound?: string;
    smell?: string;
    touch?: string;
    taste?: string;
  };
  timestamp: number;
  orderIndex: number;
}

// ============ SUDOKU ============

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface SudokuStats {
  totalSessions: number;
  totalPuzzlesSolved: number;
  averageTime: number;
  bestTimeEasy: number | null;
  bestTimeMedium: number | null;
  bestTimeHard: number | null;
  currentDifficulty: SudokuDifficulty;
}

export interface SudokuSession {
  id: string;
  difficulty: SudokuDifficulty;
  startedAt: number;
  completedAt: number;
  timeElapsed: number;
  moveCount: number;
  xpEarned: number;
}

export interface SudokuCell {
  value: number | null;
  notes: number[];
  isPrefilled: boolean;
  hasConflict: boolean;
}

export interface CellPosition {
  row: number;
  col: number;
}

// ============ SEMANTIC CHAIN ============

export type SemanticChainCategory =
  | 'animals'
  | 'foods'
  | 'countries'
  | 'colors'
  | 'occupations'
  | 'science'
  | 'psychology'
  | 'technology';
export type SemanticChainDifficulty = 'easy' | 'medium' | 'hard';

export interface SemanticChainStats {
  totalSessions: number;
  totalWordsChained: number;
  longestChain: number;
  averageChainLength: number;
  currentDifficulty: SemanticChainDifficulty;
  favoriteCategory: SemanticChainCategory | null;
}

export interface SemanticChainSession {
  id: string;
  category: SemanticChainCategory;
  difficulty: SemanticChainDifficulty;
  chainLength: number;
  wordsUsed: string[];
  startedAt: number;
  completedAt: number;
  xpEarned: number;
}

// ============ DUAL N-BACK ============

export interface DualNBackStats {
  totalSessions: number;
  totalTrials: number;
  highestN: number;
  averageAccuracy: number;
  positionAccuracy: number;
  audioAccuracy: number;
  currentN: number;
}

export interface DualNBackSession {
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

export interface DualNBackTrial {
  position: number; // 0-8 for 3x3 grid
  letter: string;
  positionMatch: boolean;
  audioMatch: boolean;
  userPositionResponse: boolean;
  userAudioResponse: boolean;
  responseTime: number | null;
}

// ============ MENTAL MATH SPRINT ============

export type MentalMathSprintDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type MentalMathOperation = '+' | '-' | '*' | '/';

export interface MentalMathSprintStats {
  totalSessions: number;
  totalProblems: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageTimePerProblem: number;
  bestStreak: number;
  currentDifficulty: MentalMathSprintDifficulty;
}

export interface MentalMathStep {
  operation: MentalMathOperation;
  operand: number;
  intermediateResult: number;
}

export interface MentalMathProblem {
  id: string;
  startValue: number;
  operations: MentalMathStep[];
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
  timeToAnswer: number | null;
  timedOut: boolean;
  // Expression mode (for Expert difficulty)
  expression?: string;        // Raw expression: "(8 + 4) * 3"
  displayExpression?: string; // Display with symbols: "(8 + 4) × 3"
}

export interface MentalMathSprintSession {
  id: string;
  difficulty: MentalMathSprintDifficulty;
  problems: MentalMathProblem[];
  totalCorrect: number;
  totalProblems: number;
  accuracy: number;
  bestStreak: number;
  averageTime: number;
  startedAt: number;
  completedAt: number;
  xpEarned: number;
}

// ============ GAMIFICATION ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'volume' | 'milestone' | 'special';
  xpReward: number;
  unlockedAt?: number;
}

export interface DailyChallenge {
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

export interface PendingNotification {
  id: string;
  type: 'detail_recall' | 'daily_reminder' | 'streak_warning';
  scheduledFor: number;
  data: Record<string, unknown>;
  sent: boolean;
}

// ============ GAME STATE ============

export type GamePhase = 'ready' | 'active' | 'review' | 'complete';

export type ModuleType = 'dual-n-back' | 'echo-chamber' | 'detail-hunter' | 'reverse-recall' | 'sudoku' | 'semantic-chain' | 'mental-math-sprint';

// ============ STORAGE ============

export interface StoredData<T> {
  version: number;
  data: T;
  lastModified: number;
}

// ============ XP & SCORING ============

export interface LevelUpResult {
  previousLevel: number;
  newLevel: number;
  xpForNextLevel: number;
}

export interface SessionResult {
  moduleType: ModuleType;
  accuracy: number;
  xpEarned: number;
  timestamp: number;
}
