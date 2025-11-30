import { CheckCircle2, XCircle } from 'lucide-react';

interface FeedbackOverlayProps {
  show: boolean;
  isCorrect: boolean;
  message: string;
}

export function FeedbackOverlay({ show, isCorrect, message }: FeedbackOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      data-testid="feedback-overlay"
    >
      <div className="bg-card border-2 border-card-border rounded-lg p-8 max-w-md shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center gap-4">
          {isCorrect ? (
            <CheckCircle2 className="w-16 h-16 text-success" data-testid="icon-success" />
          ) : (
            <XCircle className="w-16 h-16 text-warning" data-testid="icon-error" />
          )}
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-warning'}`}>
              {isCorrect ? 'Correct!' : 'Try Again'}
            </h3>
            <p className="text-base text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
