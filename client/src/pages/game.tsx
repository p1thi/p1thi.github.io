import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Question, Line, Point, ValidationResult, UserAnswer } from '@shared/schema';
import { GeometricCanvas } from '@/components/GeometricCanvas';
import { QuestionPanel } from '@/components/QuestionPanel';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { ProgressBar } from '@/components/ProgressBar';
import { FeedbackOverlay } from '@/components/FeedbackOverlay';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function Game() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userLines, setUserLines] = useState<Line[]>([]);
  const [userPoints, setUserPoints] = useState<Point[]>([]);
  const [activeTool, setActiveTool] = useState<'point' | 'line' | 'angle_bisector' | 'measure' | null>('line');
  const [showGrid, setShowGrid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [score, setScore] = useState(0);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
  });

  const validateMutation = useMutation({
    mutationFn: async (answer: UserAnswer) => {
      const res = await apiRequest('POST', '/api/validate', answer);
      return await res.json() as ValidationResult;
    },
    onSuccess: (result) => {
      setValidationResult(result);
      setIsSubmitted(true);
      setShowOverlay(true);
      
      if (result.isCorrect) {
        setScore((prev) => prev + 1);
      }

      setTimeout(() => {
        setShowOverlay(false);
      }, 2000);
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleAddLine = useCallback((line: Line) => {
    setUserLines((prev) => [...prev, line]);
  }, []);

  const handleAddPoint = useCallback((point: Point) => {
    setUserPoints((prev) => [...prev, point]);
  }, []);

  const handleUndo = useCallback(() => {
    if (userLines.length > 0) {
      setUserLines((prev) => prev.slice(0, -1));
    } else if (userPoints.length > 0) {
      setUserPoints((prev) => prev.slice(0, -1));
    }
  }, [userLines.length, userPoints.length]);

  const handleClear = useCallback(() => {
    setUserLines([]);
    setUserPoints([]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion) return;

    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      drawnLines: userLines,
      drawnPoints: userPoints,
    };
    validateMutation.mutate(answer);
  }, [currentQuestion, userLines, userPoints, validateMutation]);

  const handleRetry = useCallback(() => {
    setIsSubmitted(false);
    setValidationResult(null);
    setUserLines([]);
    setUserPoints([]);
  }, []);

  const handleNext = useCallback(() => {
    if (!questions) return;
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserLines([]);
      setUserPoints([]);
      setIsSubmitted(false);
      setValidationResult(null);
      setActiveTool('line');
    }
  }, [questions, currentQuestionIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card h-16 flex items-center px-6">
          <Skeleton className="h-8 w-48" />
        </header>
        <main className="container mx-auto max-w-7xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-[600px]" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No questions available</h2>
          <p className="text-muted-foreground">Please check back later.</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
          <p className="text-muted-foreground">
            You scored {score} out of {questions.length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="game-page">
      <header className="border-b bg-card h-16 flex items-center px-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-foreground" data-testid="game-title">
            TrigonQuest
          </h1>
        </div>
      </header>

      <div className="border-b bg-card px-6 py-2">
        <div className="container mx-auto max-w-7xl">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            score={score}
          />
        </div>
      </div>

      <main className="container mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 max-w-md">
            <QuestionPanel
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onSubmit={handleSubmit}
              onNext={handleNext}
              onRetry={handleRetry}
              isSubmitted={isSubmitted}
              isCorrect={validationResult?.isCorrect ?? null}
              feedback={validationResult?.message ?? null}
              disabled={validateMutation.isPending}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <DrawingToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid((prev) => !prev)}
              disabled={isSubmitted}
            />

            <GeometricCanvas
              givenPoints={currentQuestion.givenPoints}
              givenLines={currentQuestion.givenLines}
              givenAngles={currentQuestion.givenAngles}
              userLines={userLines}
              userPoints={userPoints}
              onAddLine={handleAddLine}
              onAddPoint={handleAddPoint}
              onUndo={handleUndo}
              onClear={handleClear}
              activeTool={activeTool}
              showGrid={showGrid}
              disabled={isSubmitted}
            />
          </div>
        </div>
      </main>

      <FeedbackOverlay
        show={showOverlay}
        isCorrect={validationResult?.isCorrect ?? false}
        message={validationResult?.message ?? ''}
      />
    </div>
  );
}
