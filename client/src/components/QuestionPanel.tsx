import { Question } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: () => void;
  onNext?: () => void;
  onRetry?: () => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  feedback: string | null;
  disabled?: boolean;
}

export function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  onRetry,
  isSubmitted,
  isCorrect,
  feedback,
  disabled = false,
}: QuestionPanelProps) {
  return (
    <Card className="h-full flex flex-col" data-testid="question-panel">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="question-number-badge">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          {question.type === 'angle_bisector' && (
            <Badge variant="outline" data-testid="question-type-badge">
              Angle Bisector
            </Badge>
          )}
        </div>
        <h2 className="text-xl font-semibold leading-relaxed" data-testid="question-title">
          {question.title}
        </h2>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 pb-4">
        <div className="space-y-2">
          <p className="text-base leading-relaxed text-foreground" data-testid="question-description">
            {question.description}
          </p>
        </div>

        {question.instructions && question.instructions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {question.instructions.map((instruction, idx) => (
                <li key={idx} className="leading-relaxed" data-testid={`instruction-${idx}`}>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}

        {isSubmitted && feedback && (
          <div
            className={`rounded-md p-4 flex items-start gap-3 animate-fade-in ${
              isCorrect
                ? 'bg-success/10 border border-success/20'
                : 'bg-warning/10 border border-warning/20'
            }`}
            data-testid="feedback-message"
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${isCorrect ? 'text-success' : 'text-warning'}`}>
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </p>
              <p className="text-sm text-foreground mt-1">{feedback}</p>
            </div>
          </div>
        )}

        {question.hint && !isSubmitted && (
          <div className="rounded-md p-4 bg-muted/50 border border-muted" data-testid="hint-box">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Hint:</span> {question.hint}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        {!isSubmitted ? (
          <Button
            onClick={onSubmit}
            disabled={disabled}
            className="w-full"
            data-testid="button-submit"
          >
            Check Answer
          </Button>
        ) : (
          <>
            {isCorrect && onNext && (
              <Button
                onClick={onNext}
                className="w-full"
                data-testid="button-next"
              >
                Next Question
              </Button>
            )}
            {!isCorrect && onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                className="w-full"
                data-testid="button-retry"
              >
                Clear and Try Again
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
