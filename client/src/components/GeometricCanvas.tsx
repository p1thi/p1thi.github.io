import { useRef, useState, useCallback, useEffect } from 'react';
import { Point, Line, Angle } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Undo2, Eraser } from 'lucide-react';

interface GeometricCanvasProps {
  givenPoints: Point[];
  givenLines: Line[];
  givenAngles: Angle[];
  userLines: Line[];
  userPoints: Point[];
  onAddLine: (line: Line) => void;
  onAddPoint: (point: Point) => void;
  onUndo: () => void;
  onClear: () => void;
  activeTool: 'point' | 'line' | 'angle_bisector' | 'measure' | null;
  showGrid?: boolean;
  disabled?: boolean;
}

export function GeometricCanvas({
  givenPoints,
  givenLines,
  givenAngles,
  userLines,
  userPoints,
  onAddLine,
  onAddPoint,
  onUndo,
  onClear,
  activeTool,
  showGrid = false,
  disabled = false,
}: GeometricCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [previewLine, setPreviewLine] = useState<Line | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GRID_SIZE = 20;
  const SNAP_THRESHOLD = 15;

  const snapToGrid = (point: Point): Point => {
    return {
      x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
    };
  };

  const snapToPoint = (point: Point, points: Point[]): Point => {
    for (const p of points) {
      const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
      if (distance < SNAP_THRESHOLD) {
        return p;
      }
    }
    return point;
  };

  const getSVGPoint = (e: React.MouseEvent<SVGSVGElement>): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const calculateBisectorEndPoint = (angle: Angle, length: number = 200): Point => {
    const angle1 = Math.atan2(angle.point1.y - angle.vertex.y, angle.point1.x - angle.vertex.x);
    
    let angleDiff: number;
    
    if (angle.measure !== undefined) {
      angleDiff = (angle.measure * Math.PI) / 180;
    } else {
      const angle2 = Math.atan2(angle.point2.y - angle.vertex.y, angle.point2.x - angle.vertex.x);
      angleDiff = angle2 - angle1;
      
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    }
    
    const bisectorAngle = angle1 + angleDiff / 2;
    
    return {
      x: angle.vertex.x + length * Math.cos(bisectorAngle),
      y: angle.vertex.y + length * Math.sin(bisectorAngle),
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    
    const point = getSVGPoint(e);
    const allPoints = [...givenPoints, ...userPoints];
    const snappedPoint = snapToPoint(showGrid ? snapToGrid(point) : point, allPoints);

    if (activeTool === 'line' && currentPoint) {
      setPreviewLine({
        start: currentPoint,
        end: snappedPoint,
        isUserDrawn: true,
      });
    } else if (activeTool === 'angle_bisector' && givenAngles.length > 0) {
      if (!currentPoint) {
        let nearestAngle = null;
        let minDistance = Infinity;
        
        for (const angle of givenAngles) {
          const distance = Math.sqrt(
            Math.pow(snappedPoint.x - angle.vertex.x, 2) + Math.pow(snappedPoint.y - angle.vertex.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestAngle = angle;
          }
        }
        
        if (nearestAngle) {
          const isNearVertex = minDistance < SNAP_THRESHOLD;

          if (isNearVertex) {
            const theoreticalEnd = calculateBisectorEndPoint(nearestAngle);
            setPreviewLine({
              start: nearestAngle.vertex,
              end: theoreticalEnd,
              isUserDrawn: true,
            });
          } else {
            setPreviewLine(null);
          }
        }
      } else if (currentPoint && selectedAngle) {
        const vertex = selectedAngle.vertex;
        const theoreticalEnd = calculateBisectorEndPoint(selectedAngle);
        const userAngle = Math.atan2(snappedPoint.y - vertex.y, snappedPoint.x - vertex.x);
        const theoreticalAngle = Math.atan2(theoreticalEnd.y - vertex.y, theoreticalEnd.x - vertex.x);
        
        let angleDiff = Math.abs(userAngle - theoreticalAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        const snapTolerance = 0.15;
        let endPoint = snappedPoint;
        
        if (angleDiff < snapTolerance) {
          const distance = Math.sqrt(
            Math.pow(snappedPoint.x - vertex.x, 2) + Math.pow(snappedPoint.y - vertex.y, 2)
          );
          endPoint = {
            x: vertex.x + distance * Math.cos(theoreticalAngle),
            y: vertex.y + distance * Math.sin(theoreticalAngle),
          };
        }
        
        setPreviewLine({
          start: currentPoint,
          end: endPoint,
          isUserDrawn: true,
        });
      }
    }

    const pointDistance = allPoints.find(p => 
      Math.sqrt(Math.pow(p.x - snappedPoint.x, 2) + Math.pow(p.y - snappedPoint.y, 2)) < SNAP_THRESHOLD
    );
    setHoveredPoint(pointDistance || null);
  }, [activeTool, currentPoint, selectedAngle, givenPoints, userPoints, givenAngles, showGrid, disabled]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    
    const point = getSVGPoint(e);
    const allPoints = [...givenPoints, ...userPoints];
    const snappedPoint = snapToPoint(showGrid ? snapToGrid(point) : point, allPoints);

    if (activeTool === 'point') {
      onAddPoint(snappedPoint);
    } else if (activeTool === 'line') {
      if (!currentPoint) {
        setCurrentPoint(snappedPoint);
      } else {
        onAddLine({
          start: currentPoint,
          end: snappedPoint,
          isUserDrawn: true,
        });
        setCurrentPoint(null);
        setPreviewLine(null);
      }
    } else if (activeTool === 'angle_bisector' && givenAngles.length > 0) {
      if (!currentPoint) {
        let nearestAngle = null;
        let minDistance = Infinity;
        
        for (const angle of givenAngles) {
          const distance = Math.sqrt(
            Math.pow(snappedPoint.x - angle.vertex.x, 2) + Math.pow(snappedPoint.y - angle.vertex.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestAngle = angle;
          }
        }
        
        if (nearestAngle && minDistance < SNAP_THRESHOLD) {
          setCurrentPoint(nearestAngle.vertex);
          setSelectedAngle(nearestAngle);
        }
      } else if (currentPoint && selectedAngle) {
        const vertex = selectedAngle.vertex;
        const theoreticalEnd = calculateBisectorEndPoint(selectedAngle);
        const userAngle = Math.atan2(snappedPoint.y - vertex.y, snappedPoint.x - vertex.x);
        const theoreticalAngle = Math.atan2(theoreticalEnd.y - vertex.y, theoreticalEnd.x - vertex.x);
        
        let angleDiff = Math.abs(userAngle - theoreticalAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        const snapTolerance = 0.15;
        let endPoint = snappedPoint;
        
        if (angleDiff < snapTolerance) {
          const distance = Math.sqrt(
            Math.pow(snappedPoint.x - vertex.x, 2) + Math.pow(snappedPoint.y - vertex.y, 2)
          );
          endPoint = {
            x: vertex.x + distance * Math.cos(theoreticalAngle),
            y: vertex.y + distance * Math.sin(theoreticalAngle),
          };
        }
        
        onAddLine({
          start: currentPoint,
          end: endPoint,
          isUserDrawn: true,
        });
        setCurrentPoint(null);
        setPreviewLine(null);
        setSelectedAngle(null);
      }
    }
  }, [activeTool, currentPoint, selectedAngle, givenPoints, userPoints, givenAngles, onAddPoint, onAddLine, showGrid, disabled]);

  const handleMouseLeave = () => {
    setPreviewLine(null);
    setHoveredPoint(null);
  };

  const calculateAngleDegrees = (angle: Angle): number => {
    const v1 = {
      x: angle.point1.x - angle.vertex.x,
      y: angle.point1.y - angle.vertex.y,
    };
    const v2 = {
      x: angle.point2.x - angle.vertex.x,
      y: angle.point2.y - angle.vertex.y,
    };
    
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    let degrees = ((angle2 - angle1) * 180) / Math.PI;
    
    if (degrees < 0) degrees += 360;
    if (degrees > 180) degrees = 360 - degrees;
    
    return Math.round(degrees);
  };

  const drawAngleArc = (angle: Angle) => {
    const radius = 40;
    const v1 = {
      x: angle.point1.x - angle.vertex.x,
      y: angle.point1.y - angle.vertex.y,
    };
    const v2 = {
      x: angle.point2.x - angle.vertex.x,
      y: angle.point2.y - angle.vertex.y,
    };

    const startAngle = Math.atan2(v1.y, v1.x);
    const endAngle = Math.atan2(v2.y, v2.x);

    const startX = angle.vertex.x + radius * Math.cos(startAngle);
    const startY = angle.vertex.y + radius * Math.sin(startAngle);
    const endX = angle.vertex.x + radius * Math.cos(endAngle);
    const endY = angle.vertex.y + radius * Math.sin(endAngle);

    let largeArcFlag = 0;
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;
    if (angleDiff > Math.PI) largeArcFlag = 1;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  return (
    <div className="flex flex-col gap-2" data-testid="canvas-container">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={disabled || (userLines.length === 0 && userPoints.length === 0)}
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            disabled={disabled || (userLines.length === 0 && userPoints.length === 0)}
            data-testid="button-clear"
          >
            <Eraser className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="relative rounded-md border-2 border-border bg-white overflow-hidden">
        <svg
          ref={svgRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
          className={`${disabled ? 'cursor-not-allowed' : activeTool === 'point' ? 'cursor-crosshair' : 'cursor-pointer'}`}
          data-testid="svg-canvas"
        >
          {showGrid && (
            <g className="grid">
              {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * GRID_SIZE}
                  y1={0}
                  x2={i * GRID_SIZE}
                  y2={CANVAS_HEIGHT}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * GRID_SIZE}
                  x2={CANVAS_WIDTH}
                  y2={i * GRID_SIZE}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {givenLines.map((line, idx) => (
            <line
              key={`given-line-${idx}`}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="hsl(217, 91%, 35%)"
              strokeWidth="2"
              data-testid={`line-given-${idx}`}
            />
          ))}

          {userLines.map((line, idx) => (
            <line
              key={`user-line-${idx}`}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="hsl(262, 83%, 45%)"
              strokeWidth="2"
              strokeDasharray="none"
              data-testid={`line-user-${idx}`}
            />
          ))}

          {previewLine && (
            <line
              x1={previewLine.start.x}
              y1={previewLine.start.y}
              x2={previewLine.end.x}
              y2={previewLine.end.y}
              stroke="hsl(262, 83%, 45%)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}

          {givenAngles.map((angle, idx) => (
            <g key={`angle-${idx}`}>
              <path
                d={drawAngleArc(angle)}
                fill="none"
                stroke="hsl(217, 91%, 35%)"
                strokeWidth="1.5"
                data-testid={`angle-arc-${idx}`}
              />
              <text
                x={angle.vertex.x + 50}
                y={angle.vertex.y - 10}
                className="font-mono text-xs"
                fill="hsl(217, 91%, 35%)"
                data-testid={`angle-label-${idx}`}
              >
                {angle.measure ? `${angle.measure}°` : `${calculateAngleDegrees(angle)}°`}
              </text>
            </g>
          ))}

          {givenPoints.map((point, idx) => (
            <circle
              key={`given-point-${idx}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="hsl(217, 91%, 35%)"
              stroke="white"
              strokeWidth="2"
              data-testid={`point-given-${idx}`}
            />
          ))}

          {userPoints.map((point, idx) => (
            <circle
              key={`user-point-${idx}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="hsl(262, 83%, 45%)"
              stroke="white"
              strokeWidth="2"
              data-testid={`point-user-${idx}`}
            />
          ))}

          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="8"
              fill="none"
              stroke="hsl(217, 91%, 35%)"
              strokeWidth="2"
              opacity="0.5"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
