import React, { useState } from 'react';
import type { Task } from '../types';
import { formatDuration } from '../utils/timeUtils';
import './TaskCard.css';

/**
 * Props interface for the TaskCard component
 * Defines the structure of props passed to the TaskCard
 */
interface TaskCardProps {
  /** The task object to be displayed in the card */
  task: Task;
  /**
   * Callback function triggered when the task card is clicked
   * @param taskId - The unique identifier of the clicked task
   */
  onClick: (taskId: string) => void;
  /**
   * Optional flag to indicate if the task is currently being dragged
   * Used to apply visual styling during drag operations
   */
  isDragging?: boolean;
  /**
   * Optional variant to determine the styling context
   * 'pool' for TaskPool display, 'timeline' for Timeline display
   * @default 'pool'
   */
  variant?: 'pool' | 'timeline';
}

/**
 * TaskCard Component
 *
 * Renders an individual task card with draggable and clickable functionality
 * Displays task name and duration, and supports drag and click interactions
 * When placed on timeline, the card spans multiple slots based on task duration
 *
 * @component
 * @param {TaskCardProps} props - Component properties
 * @returns {React.ReactElement} Rendered task card element
 */
export const TaskCard = ({
  task,
  onClick,
  isDragging,
  variant = 'pool',
}: TaskCardProps) => {
  /**
   * Lock state for preventing drag and drop when true
   * Only used when variant is 'timeline'
   */
  const [isLocked, setIsLocked] = useState(false);

  /**
   * Calculate the width style for timeline placement
   * When on timeline, task cards should span multiple slots based on duration
   */
  const getTimelineStyle = (): React.CSSProperties => {
    if (task.position) {
      // Each slot is 60px wide + 1px gap, total 61px per duration unit
      const slotWidth = 60;
      const gapWidth = 1;
      const totalWidth =
        task.duration * slotWidth + (task.duration - 1) * gapWidth - 2;

      return {
        width: `${totalWidth}px`,
        right: 'auto', // Override the CSS 'right: 2px' to allow custom width
      };
    }
    return {};
  };
  /**
   * Toggle the lock state of the task card
   * Only functional when variant is 'timeline'
   */
  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    setIsLocked(!isLocked);
  };

  /**
   * Handles the drag start event for the task card
   * Sets the task ID as transfer data and configures drag effect
   * Prevents drag if the card is locked
   *
   * @param {React.DragEvent} e - The drag start event
   */
  const handleDragStart = (e: React.DragEvent) => {
    // Prevent dragging if locked and on timeline
    if (variant === 'timeline' && isLocked) {
      e.preventDefault();
      return;
    }

    // Store the task ID as plain text data for drag and drop operations
    e.dataTransfer.setData('text/plain', task.id);
    // Set the allowed drag effect to 'move'
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handles click event on the task card
   * Invokes the onClick callback with the task's unique identifier
   */
  const handleClick = () => {
    onClick(task.id);
  };

  return (
    <div
      // Dynamically apply variant, dragging, and locked classes
      className={`task-card task-card--${variant} ${isDragging ? 'dragging' : ''}${isLocked && variant === 'timeline' ? ' locked' : ''}`}
      // Make the div draggable only if not locked or not on timeline
      draggable={!(variant === 'timeline' && isLocked)}
      // Attach drag start and click event handlers
      onDragStart={handleDragStart}
      onClick={handleClick}
      // Apply timeline-specific styling for width calculation
      style={getTimelineStyle()}
    >
      <div className="task-card-header">
        {/* Display the task name */}
        <span className="task-name">{task.name}</span>

        {/* Lock/Unlock toggle button - only shown on timeline variant */}
        {variant === 'timeline' && (
          <button
            className="task-card-lock-toggle"
            onClick={handleToggleLock}
            aria-label={isLocked ? 'Unlock task' : 'Lock task'}
            title={
              isLocked
                ? 'Unlock task to allow dragging'
                : 'Lock task to prevent dragging'
            }
          >
            {isLocked ? '🔒' : '🔓'}
          </button>
        )}
      </div>
      {variant !== 'timeline' && (
        <div className="task-card-body">
          <span className="task-duration">{formatDuration(task.duration)}</span>
        </div>
      )}
    </div>
  );
};
