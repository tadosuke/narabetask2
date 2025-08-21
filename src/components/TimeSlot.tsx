import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { TimelineUtils } from '../utils/timelineUtils';
import { ConflictService } from '../services/conflictService';
import './TimeSlot.css';

/**
 * Props interface for the TimeSlot component
 * Defines the input parameters required to render a single time slot
 *
 * @interface TimeSlotProps
 * @property {Task[]} tasks - Array of all tasks to check for conflicts and positioning
 * @property {Task[]} timelineTasks - Array of tasks currently placed on the timeline
 * @property {string} timeSlot - The time slot string (e.g., "09:00", "14:30")
 * @property {number} rowIndex - The row index where this time slot is positioned
 * @property {Function} onTaskClick - Callback function triggered when a task is clicked
 * @property {Function} onDragOver - Callback function for drag over events
 * @property {Function} onDrop - Callback function for drop events
 */
interface TimeSlotProps {
  tasks: Task[];
  timelineTasks: Task[];
  timeSlot: string;
  rowIndex: number;
  onTaskClick: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, row: number, timeSlot: string) => void;
}

/**
 * TimeSlot Component
 *
 * Renders a single time slot cell in the timeline grid
 *
 * Key features:
 * - Displays tasks that occupy this time slot
 * - Shows conflict indicators when multiple tasks overlap
 * - Handles drag and drop interactions
 * - Provides tooltips for conflict information
 *
 * @component
 * @param {TimeSlotProps} props - Component properties
 * @returns {React.ReactElement} Rendered time slot component
 */
export const TimeSlot = ({
  tasks,
  timelineTasks,
  timeSlot,
  rowIndex,
  onTaskClick,
  onDragOver,
  onDrop,
}: TimeSlotProps) => {
  // Determine task status and conflict information
  const taskAtPosition = TimelineUtils.getTaskAtPosition(
    timelineTasks,
    rowIndex,
    timeSlot
  );
  const hasConflict = ConflictService.hasTimeSlotConflict(tasks, timeSlot);
  const isConflictSlot = hasConflict && taskAtPosition;

  // Generate tooltip text for conflicting tasks
  const conflictTooltip = ConflictService.generateConflictTooltip(
    tasks,
    timeSlot
  );

  return (
    <div
      key={`${rowIndex}-${timeSlot}`}
      data-testid="time-slot"
      // Dynamic CSS classes for slot state
      className={`timeline-slot ${taskAtPosition ? 'occupied' : 'empty'} ${isConflictSlot ? 'conflict' : ''}`}
      title={conflictTooltip}
      // Drag and drop event handlers
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, rowIndex, timeSlot)}
    >
      {/* Render task card only at its start time */}
      {taskAtPosition &&
        TimelineUtils.isTaskStartSlot(taskAtPosition, timeSlot) && (
          <TaskCard
            task={taskAtPosition}
            onClick={onTaskClick}
            variant="timeline"
          />
        )}
    </div>
  );
};
