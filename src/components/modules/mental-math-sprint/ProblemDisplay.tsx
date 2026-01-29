import type { MentalMathProblem, MentalMathOperation } from '../../../types';

interface ProblemDisplayProps {
  problem: MentalMathProblem;
  showAnswer?: boolean;
  userAnswer?: string;
}

function formatOperation(op: MentalMathOperation): string {
  switch (op) {
    case '+': return '+';
    case '-': return '-';
    case '*': return '\u00d7'; // multiplication sign
    case '/': return '\u00f7'; // division sign
  }
}

export function ProblemDisplay({
  problem,
  showAnswer = false,
  userAnswer,
}: ProblemDisplayProps): JSX.Element {
  const isCorrect = problem.isCorrect;
  const displayAnswer = showAnswer && userAnswer !== undefined;
  const isExpression = !!problem.displayExpression;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {isExpression ? (
        // Expression display (Expert mode)
        <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl font-mono">
          <span className="text-[var(--text-primary)] font-bold">
            {problem.displayExpression}
          </span>
          <span className="text-[var(--text-secondary)]">=</span>
          {displayAnswer ? (
            <span
              className={`font-bold px-3 py-1 rounded-lg ${
                isCorrect === true
                  ? 'text-accent-success bg-green-100 dark:bg-green-900/30'
                  : isCorrect === false
                    ? 'text-accent-error bg-red-100 dark:bg-red-900/30'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              {userAnswer}
              {isCorrect === true && ' ✓'}
              {isCorrect === false && ` ✗ (${problem.correctAnswer})`}
            </span>
          ) : (
            <span className="text-pink-500 font-bold animate-pulse">?</span>
          )}
        </div>
      ) : (
        // Chain display (Easy/Medium/Hard)
        <div className="flex flex-wrap items-center justify-center gap-2 text-2xl sm:text-3xl font-mono">
          {/* Start value */}
          <span className="text-[var(--text-primary)] font-bold">{problem.startValue}</span>

          {/* Operations */}
          {problem.operations.map((step, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">→</span>
              <span className="text-pink-500 font-semibold">
                {formatOperation(step.operation)}{step.operand}
              </span>
            </span>
          ))}

          {/* Arrow to answer */}
          <span className="text-[var(--text-secondary)]">→</span>

          {/* Answer slot */}
          {displayAnswer ? (
            <span
              className={`font-bold px-3 py-1 rounded-lg ${
                isCorrect === true
                  ? 'text-accent-success bg-green-100 dark:bg-green-900/30'
                  : isCorrect === false
                    ? 'text-accent-error bg-red-100 dark:bg-red-900/30'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              {userAnswer}
              {isCorrect === true && ' ✓'}
              {isCorrect === false && ` ✗ (${problem.correctAnswer})`}
            </span>
          ) : (
            <span className="text-pink-500 font-bold animate-pulse">?</span>
          )}
        </div>
      )}

      {/* Timeout indicator */}
      {problem.timedOut && (
        <p className="mt-4 text-sm text-accent-error">
          Time's up! The answer was {problem.correctAnswer}
        </p>
      )}
    </div>
  );
}
