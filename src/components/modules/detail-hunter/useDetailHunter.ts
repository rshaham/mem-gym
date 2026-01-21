import { useState, useCallback, useRef, useEffect } from 'react';
import type { CachedImage, QuizQuestion, DetailHunterSession } from '../../../types';
import imageCache from '../../../data/detail-hunter-cache.json';

// ============ TYPES ============

type DetailHunterPhase = 'setup' | 'viewing' | 'waiting' | 'quiz' | 'results';

interface UseDetailHunterOptions {
  onViewingComplete?: () => void;
  onQuizComplete?: (session: DetailHunterSession) => void;
}

export interface DetailHunterResults {
  score: number; // 0-100
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  questions: QuizQuestion[];
}

interface UseDetailHunterReturn {
  phase: DetailHunterPhase;
  selectedImage: CachedImage | null;
  viewingTimeLeft: number;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  session: DetailHunterSession | null;
  availableCategories: string[];
  startSession: (category: string, viewingTime: number, delayMinutes: number) => void;
  finishViewing: () => void;
  startQuiz: () => void;
  answerQuestion: (answer: string) => void;
  getResults: () => DetailHunterResults;
  reset: () => void;
}

// ============ HELPER FUNCTIONS ============

/**
 * Selects a random image from the cache matching the given category
 * If category is 'all', selects from all images
 */
function selectImageByCategory(category: string): CachedImage | null {
  const images = (imageCache as { images: CachedImage[] }).images;

  const filteredImages = category === 'all'
    ? images
    : images.filter(img => img.category === category);

  if (filteredImages.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filteredImages.length);
  return filteredImages[randomIndex];
}

/**
 * Creates a deep copy of questions to reset user answers
 */
function cloneQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map(q => ({
    ...q,
    userAnswer: null,
    isCorrect: null,
  }));
}

/**
 * Calculates delay bonus based on delay minutes
 * 0 min = 0 XP, 30 min = 10 XP, 60 min = 20 XP, 120 min = 40 XP
 */
function calculateDelayBonus(delayMinutes: number): number {
  if (delayMinutes <= 0) return 0;
  if (delayMinutes <= 30) return 10;
  if (delayMinutes <= 60) return 20;
  return 40;
}

/**
 * Calculates viewing bonus based on viewing time
 * 30s = 0 XP, 20s = 5 XP, 15s = 10 XP, 10s = 20 XP
 */
function calculateViewingBonus(viewingTime: number): number {
  if (viewingTime >= 30) return 0;
  if (viewingTime >= 20) return 5;
  if (viewingTime >= 15) return 10;
  return 20;
}

/**
 * Calculates XP earned for a Detail Hunter session
 * - Base XP: 10 per question
 * - Accuracy bonus: floor((score/100) * 50)
 * - Delay bonus: 0 for instant, 10 for 30min, 20 for 1hr, 40 for 2hr
 * - Viewing bonus: 0 for 30s, 5 for 20s, 10 for 15s, 20 for 10s
 */
function calculateXP(
  score: number,
  totalQuestions: number,
  viewingTime: number,
  delayMinutes: number
): number {
  const baseXP = 10 * totalQuestions;
  const accuracyBonus = Math.floor((score / 100) * 50);
  const delayBonus = calculateDelayBonus(delayMinutes);
  const viewingBonus = calculateViewingBonus(viewingTime);

  return baseXP + accuracyBonus + delayBonus + viewingBonus;
}

/**
 * Calculates score as percentage of correct answers
 */
function calculateScore(questions: QuizQuestion[]): number {
  if (questions.length === 0) return 0;

  const correctCount = questions.filter(q => q.isCorrect === true).length;
  return Math.round((correctCount / questions.length) * 100);
}

// ============ HOOK ============

export function useDetailHunter({
  onViewingComplete,
  onQuizComplete,
}: UseDetailHunterOptions = {}): UseDetailHunterReturn {
  const [phase, setPhase] = useState<DetailHunterPhase>('setup');
  const [selectedImage, setSelectedImage] = useState<CachedImage | null>(null);
  const [viewingTimeLeft, setViewingTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [session, setSession] = useState<DetailHunterSession | null>(null);

  // Session configuration refs
  const viewingTimeRef = useRef<number>(30);
  const delayMinutesRef = useRef<number>(0);

  // Timer refs
  const viewingTimerRef = useRef<number | null>(null);

  // Callback refs to avoid stale closures
  const onViewingCompleteRef = useRef(onViewingComplete);
  const onQuizCompleteRef = useRef(onQuizComplete);

  useEffect(() => {
    onViewingCompleteRef.current = onViewingComplete;
  }, [onViewingComplete]);

  useEffect(() => {
    onQuizCompleteRef.current = onQuizComplete;
  }, [onQuizComplete]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (viewingTimerRef.current !== null) {
        window.clearInterval(viewingTimerRef.current);
      }
    };
  }, []);

  // Get available categories from the cache
  const availableCategories = (imageCache as { categories: string[] }).categories;

  /**
   * Starts a new Detail Hunter session
   */
  const startSession = useCallback((category: string, viewingTime: number, delayMinutes: number) => {
    // Select a random image matching the category
    const image = selectImageByCategory(category);

    if (!image) {
      throw new Error(`No images found for category: ${category}`);
    }

    // Store configuration
    viewingTimeRef.current = viewingTime;
    delayMinutesRef.current = delayMinutes;

    // Clone questions to reset any previous answers
    const sessionQuestions = cloneQuestions(image.questions);

    // Create the session
    const newSession: DetailHunterSession = {
      id: crypto.randomUUID(),
      imageId: image.unsplashId,
      imageUrl: image.url,
      category: image.category,
      viewingTime,
      delayMinutes,
      viewedAt: Date.now(),
      quizStartedAt: null,
      questions: sessionQuestions,
      score: null,
      xpEarned: null,
      status: 'viewing',
    };

    setSelectedImage(image);
    setQuestions(sessionQuestions);
    setSession(newSession);
    setCurrentQuestionIndex(0);
    setViewingTimeLeft(viewingTime);
    setPhase('viewing');

    // Start the viewing countdown timer
    viewingTimerRef.current = window.setInterval(() => {
      setViewingTimeLeft(prev => {
        if (prev <= 1) {
          // Timer complete - clear interval
          if (viewingTimerRef.current !== null) {
            window.clearInterval(viewingTimerRef.current);
            viewingTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Called when viewing phase ends (either by timer or user action)
   */
  const finishViewing = useCallback(() => {
    // Clear the viewing timer if still running
    if (viewingTimerRef.current !== null) {
      window.clearInterval(viewingTimerRef.current);
      viewingTimerRef.current = null;
    }

    setViewingTimeLeft(0);

    // Update session status
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: delayMinutesRef.current > 0 ? 'waiting' : 'ready',
      };
    });

    // Move to waiting or quiz phase based on delay
    if (delayMinutesRef.current > 0) {
      setPhase('waiting');
    } else {
      setPhase('quiz');
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          quizStartedAt: Date.now(),
          status: 'quiz',
        };
      });
    }

    onViewingCompleteRef.current?.();
  }, []);

  /**
   * Called when user is ready to start the quiz (after waiting period)
   */
  const startQuiz = useCallback(() => {
    setPhase('quiz');
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quizStartedAt: Date.now(),
        status: 'quiz',
      };
    });
  }, []);

  /**
   * Records the user's answer for the current question
   */
  const answerQuestion = useCallback((answer: string) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      const currentQuestion = newQuestions[currentQuestionIndex];

      if (currentQuestion) {
        newQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          userAnswer: answer,
          isCorrect: answer === currentQuestion.correctAnswer,
        };
      }

      return newQuestions;
    });

    // Move to next question or complete quiz
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      // Quiz complete - calculate results after state update
      setTimeout(() => {
        setQuestions(finalQuestions => {
          const score = calculateScore(finalQuestions);
          const xpEarned = calculateXP(
            score,
            finalQuestions.length,
            viewingTimeRef.current,
            delayMinutesRef.current
          );

          // Update session with final results
          setSession(prev => {
            if (!prev) return null;

            const completedSession: DetailHunterSession = {
              ...prev,
              questions: finalQuestions,
              score,
              xpEarned,
              status: 'completed',
            };

            // Trigger completion callback
            onQuizCompleteRef.current?.(completedSession);

            return completedSession;
          });

          setPhase('results');

          return finalQuestions;
        });
      }, 0);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  /**
   * Returns the current session results
   */
  const getResults = useCallback((): DetailHunterResults => {
    const score = calculateScore(questions);
    const correctAnswers = questions.filter(q => q.isCorrect === true).length;
    const xpEarned = calculateXP(
      score,
      questions.length,
      viewingTimeRef.current,
      delayMinutesRef.current
    );

    return {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      xpEarned,
      questions,
    };
  }, [questions]);

  /**
   * Resets the hook to initial state
   */
  const reset = useCallback(() => {
    // Clear any running timers
    if (viewingTimerRef.current !== null) {
      window.clearInterval(viewingTimerRef.current);
      viewingTimerRef.current = null;
    }

    setPhase('setup');
    setSelectedImage(null);
    setViewingTimeLeft(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSession(null);
    viewingTimeRef.current = 30;
    delayMinutesRef.current = 0;
  }, []);

  return {
    phase,
    selectedImage,
    viewingTimeLeft,
    currentQuestionIndex,
    questions,
    session,
    availableCategories,
    startSession,
    finishViewing,
    startQuiz,
    answerQuestion,
    getResults,
    reset,
  };
}
