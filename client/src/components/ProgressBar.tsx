import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
}

export function ProgressBar({ current, total, score }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2" data-testid="progress-container">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground" data-testid="progress-text">
          Question {current} of {total}
        </span>
        <span className="font-medium text-primary" data-testid="score-text">
          Score: {score}/{total}
        </span>
      </div>
      <Progress value={percentage} className="h-1" data-testid="progress-bar" />
    </div>
  );
}
