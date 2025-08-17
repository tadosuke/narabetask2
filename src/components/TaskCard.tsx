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
export const TaskCard = ({ task, onClick, isDragging }: TaskCardProps) => {
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
        task.duration * slotWidth + (task.duration - 1) * gapWidth;

      return {
        width: `${totalWidth}px`,
        right: 'auto', // Override the CSS 'right: 2px' to allow custom width
      };
    }
    return {};
  };
  /**
   * Handles the drag start event for the task card
   * Sets the task ID as transfer data and configures drag effect
   *
   * @param {React.DragEvent} e - The drag start event
   */
  const handleDragStart = (e: React.DragEvent) => {
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
      // Dynamically apply 'dragging' class when isDragging is true
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      // Make the div draggable
      draggable
      // Attach drag start and click event handlers
      onDragStart={handleDragStart}
      onClick={handleClick}
      // Apply timeline-specific styling for width calculation
      style={getTimelineStyle()}
    >
      <div className="task-card-header">
        {/* Display the task name */}
        <span className="task-name">{task.name}</span>
      </div>
      <div className="task-card-body">
        {/* 
          Display task duration in minutes 
          Note: Multiplies duration by 15 to convert to minutes 
          Assumes duration is stored in some other unit (e.g., quarter-hours)
        */}
        <span className="task-duration">{formatDuration(task.duration)}</span>
      </div>
    </div>
  );
};
