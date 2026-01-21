import type { QuizQuestion as QuizQuestionType } from '../../../types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnswered,
}: QuizQuestionProps): JSX.Element {
  function getOptionStyles(option: string): string {
    const baseStyles = `
      min-h-touch w-full p-4 rounded-lg font-medium text-left
      transition-all duration-fast
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
    `;

    if (!isAnswered) {
      return `${baseStyles}
        bg-gray-100 dark:bg-gray-800
        text-[var(--text-primary)]
        hover:bg-emerald-50 dark:hover:bg-emerald-900/30
        hover:border-emerald-300 dark:hover:border-emerald-700
        border-2 border-transparent
        active:scale-[0.98]
      `;
    }

    const isCorrect = option === question.correctAnswer;
    const isUserAnswer = option === question.userAnswer;

    if (isCorrect) {
      return `${baseStyles}
        bg-emerald-100 dark:bg-emerald-900/50
        text-emerald-800 dark:text-emerald-200
        border-2 border-emerald-500
      `;
    }

    if (isUserAnswer && !isCorrect) {
      return `${baseStyles}
        bg-red-100 dark:bg-red-900/50
        text-red-800 dark:text-red-200
        border-2 border-red-500
      `;
    }

    return `${baseStyles}
      bg-gray-100 dark:bg-gray-800
      text-gray-400 dark:text-gray-500
      border-2 border-transparent
      opacity-50
    `;
  }

  return (
    <div className="w-full">
      {/* Question header */}
      <div className="mb-4 text-center">
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 text-center">
        {question.questionText}
      </h2>

      {/* Options grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, index) => (
          <button
            key={`${question.id}-option-${index}`}
            onClick={() => onAnswer(option)}
            disabled={isAnswered}
            className={getOptionStyles(option)}
            aria-label={`Option ${index + 1}: ${option}`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback after answering */}
      {isAnswered && (
        <div className="mt-4 text-center">
          {question.isCorrect ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Correct!
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400 font-medium">
              Incorrect. The answer was: {question.correctAnswer}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
