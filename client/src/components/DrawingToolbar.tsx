import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Circle, Minus, Scissors, Grid3x3 } from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: 'point' | 'line' | 'angle_bisector' | 'measure' | null;
  onToolChange: (tool: 'point' | 'line' | 'angle_bisector' | 'measure') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  disabled?: boolean;
}

export function DrawingToolbar({
  activeTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  disabled = false,
}: DrawingToolbarProps) {
  const tools = [
    { id: 'point' as const, icon: Circle, label: 'Point' },
    { id: 'line' as const, icon: Minus, label: 'Line' },
    { id: 'angle_bisector' as const, icon: Scissors, label: 'Angle Bisector' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-card" data-testid="drawing-toolbar">
      <div className="flex gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              size="sm"
              variant={isActive ? 'default' : 'ghost'}
              onClick={() => onToolChange(tool.id)}
              disabled={disabled}
              className="gap-2"
              data-testid={`tool-${tool.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tool.label}</span>
            </Button>
          );
        })}
      </div>

      <Separator orientation="vertical" className="h-8" />

      <Button
        size="sm"
        variant={showGrid ? 'default' : 'ghost'}
        onClick={onToggleGrid}
        disabled={disabled}
        className="gap-2"
        data-testid="button-toggle-grid"
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="text-sm">Grid</span>
      </Button>
    </div>
  );
}
