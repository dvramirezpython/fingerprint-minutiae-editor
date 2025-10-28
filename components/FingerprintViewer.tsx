
import React, { useState, useRef } from 'react';
import { type Minutia, MinutiaType, type ImageDimensions, AppMode } from '../types';

interface FingerprintViewerProps {
  imageSrc: string;
  imageDimensions: ImageDimensions;
  minutiae: Minutia[];
  zoom: number;
  selectedMinutiaId: string | null;
  onSelectMinutia: (id: string | null) => void;
  onAddMinutia: (x: number, y: number) => void;
  onUpdateMinutia: (id: string, updates: Partial<Minutia>) => void;
  mode: AppMode;
}

const MINUTIA_RADIUS = 5;
const MINUTIA_LINE_LENGTH = 15;

const FingerprintViewer: React.FC<FingerprintViewerProps> = ({
  imageSrc,
  imageDimensions,
  minutiae,
  zoom,
  selectedMinutiaId,
  onSelectMinutia,
  onAddMinutia,
  onUpdateMinutia,
  mode
}) => {
  const [draggingMinutiaId, setDraggingMinutiaId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; minutiaX: number; minutiaY: number; } | null>(null);

  const viewerWidth = imageDimensions.width * zoom;
  const viewerHeight = imageDimensions.height * zoom;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only handle clicks on the SVG background, not on minutiae themselves
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (mode === AppMode.ADD_ENDING || mode === AppMode.ADD_BIFURCATION) {
        onAddMinutia(clickX / zoom, clickY / zoom);
    } else if (mode === AppMode.VIEW) {
        if (selectedMinutiaId) {
            // If a minutia is selected, update its orientation based on the click
            const selectedMinutia = minutiae.find(m => m.id === selectedMinutiaId);
            if (!selectedMinutia) return;

            const minutiaCenterX = selectedMinutia.x * viewerWidth;
            const minutiaCenterY = selectedMinutia.y * viewerHeight;

            const dx = clickX - minutiaCenterX;
            const dy = clickY - minutiaCenterY;

            let angleDegrees = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angleDegrees < 0) {
                angleDegrees += 360; // Normalize to 0-360
            }

            onUpdateMinutia(selectedMinutiaId, { angle: angleDegrees });
        } else {
            // If no minutia is selected, deselect any (which does nothing)
            onSelectMinutia(null);
        }
    }
  };

  const handleMinutiaMouseDown = (e: React.MouseEvent<SVGGElement>, minutia: Minutia) => {
    if (mode !== AppMode.VIEW || e.button !== 0) return;
    e.stopPropagation();

    onSelectMinutia(minutia.id);
    setDraggingMinutiaId(minutia.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      minutiaX: minutia.x,
      minutiaY: minutia.y,
    };
  };

  const handleViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingMinutiaId || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const relativeDx = dx / viewerWidth;
    const relativeDy = dy / viewerHeight;
    
    const newX = dragStartRef.current.minutiaX + relativeDx;
    const newY = dragStartRef.current.minutiaY + relativeDy;

    onUpdateMinutia(draggingMinutiaId, {
      x: Math.max(0, Math.min(1, newX)),
      y: Math.max(0, Math.min(1, newY)),
    });
  };

  const handleViewerMouseUp = () => {
    setDraggingMinutiaId(null);
    dragStartRef.current = null;
  };

  const getCursor = () => {
    if (draggingMinutiaId) return 'grabbing';
    if (mode === AppMode.ADD_ENDING || mode === AppMode.ADD_BIFURCATION) {
        return 'crosshair';
    }
     if (mode === AppMode.VIEW && selectedMinutiaId) {
        return 'crosshair'; // Indicate orientation change is possible
    }
    return 'default';
  };

  return (
    <div 
        className="w-full h-full overflow-auto bg-gray-900 border border-border-color rounded-lg flex items-center justify-center p-2"
        onMouseMove={handleViewerMouseMove}
        onMouseUp={handleViewerMouseUp}
        onMouseLeave={handleViewerMouseUp}
    >
      <div
        className="relative"
        style={{
          width: `${viewerWidth}px`,
          height: `${viewerHeight}px`,
        }}
      >
        <img
          src={imageSrc}
          alt="Fingerprint"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        <svg
          className="absolute top-0 left-0 w-full h-full"
          style={{ cursor: getCursor() }}
          onClick={handleSvgClick}
        >
          {minutiae.map((minutia) => {
            const isSelected = minutia.id === selectedMinutiaId;
            const cx = minutia.x * viewerWidth;
            const cy = minutia.y * viewerHeight;
            const color = minutia.type === MinutiaType.ENDING ? 'rgb(248 81 73)' : 'rgb(56 139 253)'; // Corresponds to accent-red and accent-blue
            const strokeWidth = isSelected ? 3 : 1.5;
            const radius = MINUTIA_RADIUS;

            return (
              <g
                key={minutia.id}
                onMouseDown={(e) => handleMinutiaMouseDown(e, minutia)}
                className={mode === AppMode.VIEW ? 'cursor-grab' : 'cursor-pointer'}
              >
                {isSelected && <circle cx={cx} cy={cy} r={radius + 4} fill={color} fillOpacity="0.3" stroke="none" />}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                />
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + MINUTIA_LINE_LENGTH}
                  y2={cy}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  transform={`rotate(${minutia.angle}, ${cx}, ${cy})`}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default FingerprintViewer;
