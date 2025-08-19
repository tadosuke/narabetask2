import { useState, useCallback, useEffect } from 'react';
import './Splitter.css';

interface SplitterProps {
  /**
   * The orientation of the splitter
   */
  orientation: 'horizontal' | 'vertical';
  /**
   * Initial position as a percentage (0-100)
   */
  initialPosition?: number;
  /**
   * Minimum position as a percentage (0-100)
   */
  minPosition?: number;
  /**
   * Maximum position as a percentage (0-100)
   */
  maxPosition?: number;
  /**
   * Callback when the position changes
   */
  onPositionChange?: (position: number) => void;
  /**
   * CSS class name for styling
   */
  className?: string;
}

/**
 * A draggable splitter component that allows resizing between panels
 */
export function Splitter({
  orientation,
  initialPosition = 50,
  minPosition = 10,
  maxPosition = 90,
  onPositionChange,
  className = '',
}: SplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.querySelector('.app-content');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let newPosition: number;

      if (orientation === 'horizontal') {
        // For horizontal splitter, calculate based on Y position
        const relativeY = e.clientY - rect.top;
        newPosition = (relativeY / rect.height) * 100;
      } else {
        // For vertical splitter, calculate based on X position
        const relativeX = e.clientX - rect.left;
        newPosition = (relativeX / rect.width) * 100;
      }

      // Clamp the position within bounds
      newPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));

      setPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [isDragging, orientation, minPosition, maxPosition, onPositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor =
        orientation === 'horizontal' ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, orientation]);

  const splitterClass = `splitter splitter-${orientation} ${className} ${
    isDragging ? 'splitter-dragging' : ''
  }`.trim();

  return (
    <div
      className={splitterClass}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={orientation}
      aria-valuenow={Math.round(position)}
      aria-valuemin={minPosition}
      aria-valuemax={maxPosition}
      tabIndex={0}
    >
      <div className="splitter-handle">
        {orientation === 'horizontal' ? (
          <div className="splitter-dots-horizontal">
            <div className="splitter-dot" />
            <div className="splitter-dot" />
            <div className="splitter-dot" />
          </div>
        ) : (
          <div className="splitter-dots-vertical">
            <div className="splitter-dot" />
            <div className="splitter-dot" />
            <div className="splitter-dot" />
          </div>
        )}
      </div>
    </div>
  );
}
