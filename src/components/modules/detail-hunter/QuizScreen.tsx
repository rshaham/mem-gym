import type { QuizQuestion as QuizQuestionType } from '../../../types';
import { QuizQuestion } from './QuizQuestion';
import { Card } from '../../common/Card';

interface QuizScreenProps {
  questions: QuizQuestionType[];
  currentQuestionIndex: number;
  onAnswer: (answer: string) => void;
}

export function QuizScreen({
  questions,
  currentQuestionIndex,
  onAnswer,
}: QuizScreenProps): JSX.Element {
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
  const isAnswered = currentQuestion.userAnswer !== null;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
          <span>Progress</span>
          <span>{currentQuestionIndex} / {questions.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card padding="lg" className="w-full">
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={onAnswer}
          isAnswered={isAnswered}
        />
      </Card>
    </div>
  );
}
