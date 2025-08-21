import { useMemo } from 'react';
import type { Task, WorkingHours } from '../types';
import { TimeSlot } from './TimeSlot';
import { generateTimeSlots } from '../utils/timeUtils';
import { MAX_TIMELINE_ROWS } from '../constants';
import './Timeline.css';

/**
 * Props interface for the Timeline component
 * Defines the input parameters required to render and interact with the timeline
 *
 * @interface TimelineProps
 * @property {Task[]} tasks - Array of tasks to be displayed on the timeline
 * @property {WorkingHours} workingHours - Defines the start and end times of the working day
 * @property {Function} onTaskClick - Callback function triggered when a task is clicked
 * @property {Function} onTaskDrop - Callback function triggered when a task is dropped onto a new time slot
 */
interface TimelineProps {
  tasks: Task[];
  workingHours: WorkingHours;
  onTaskClick: (taskId: string) => void;
  onTaskDrop: (taskId: string, row: number, startTime: string) => void;
}

/**
 * Timeline Component
 *
 * Renders an interactive timeline for task scheduling and visualization
 *
 * Key features:
 * - Displays tasks across multiple rows with 15-minute time slots
 * - Supports drag and drop task repositioning
 * - Detects and highlights time slot conflicts
 * - Renders tasks with their respective time allocations
 *
 * @component
 * @param {TimelineProps} props - Component properties
 * @returns {React.ReactElement} Rendered timeline component
 */
export const Timeline = ({
  tasks,
  workingHours,
  onTaskClick,
  onTaskDrop,
}: TimelineProps) => {
  /**
   * Number of rows available in the timeline for task placement
   * Defines the maximum number of tasks that can be displayed simultaneously
   */
  const timeSlots = generateTimeSlots(workingHours.start, workingHours.end);
  const timelineRows = MAX_TIMELINE_ROWS; // Maximum rows for task placement

  /**
   * Handles the drag over event for timeline slots
   * Prevents default behavior and sets the drop effect to 'move'
   *
   * @param {React.DragEvent} e - The drag event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Handles the drop event when a task is dropped onto a timeline slot
   * Calls the onTaskDrop callback with task details
   *
   * @param {React.DragEvent} e - The drop event
   * @param {number} row - The row where the task is dropped
   * @param {string} timeSlot - The time slot where the task is dropped
   */
  const handleDrop = (e: React.DragEvent, row: number, timeSlot: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskDrop(taskId, row, timeSlot);
  };

  /**
   * Memoized list of tasks currently placed on the timeline
   * Filters tasks that have a non-null position
   *
   * @returns {Task[]} Array of tasks with defined positions
   */
  const timelineTasks = useMemo(
    () => tasks.filter((task) => task.position !== null),
    [tasks]
  );

  /**
   * Renders the Timeline component
   *
   * The rendering process involves:
   * 1. Creating a timeline grid with time slots
   * 2. Rendering a header with time slot labels
   * 3. Creating multiple rows for task placement
   * 4. Handling task rendering, conflicts, and drag-and-drop interactions
   *
   * @returns {React.ReactElement} Timeline component with tasks and time slots
   */
  return (
    <div
      className="timeline"
      // Dynamically sets CSS variable for responsive grid sizing
      style={{ '--time-slots': timeSlots.length } as React.CSSProperties}
    >
      {/* Timeline header showing working hours */}
      <h3>タイムライン</h3>

      <div className="timeline-grid">
        {/* Header row displaying time slot labels */}
        <div className="timeline-header">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="timeline-time-slot-header">
              {timeSlot}
            </div>
          ))}
        </div>

        {/* Timeline rows for task placement */}
        {Array.from({ length: timelineRows }, (_, rowIndex) => (
          <div key={rowIndex} className="timeline-row">
            {timeSlots.map((timeSlot) => (
              <TimeSlot
                key={`${rowIndex}-${timeSlot}`}
                tasks={tasks}
                timelineTasks={timelineTasks}
                timeSlot={timeSlot}
                rowIndex={rowIndex}
                onTaskClick={onTaskClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
