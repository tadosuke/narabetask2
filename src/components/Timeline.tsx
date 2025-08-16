import { useMemo } from 'react';
import type { Task, WorkingHours } from '../types';
import { TaskCard } from './TaskCard';

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
   * Converts a time string in HH:MM format to total minutes
   *
   * @param {string} timeStr - Time in HH:MM format
   * @returns {number} Total minutes from midnight
   * @example timeToMinutes('14:30') returns 870 (14 * 60 + 30)
   */
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  /**
   * Converts total minutes to a formatted time string
   *
   * @param {number} minutes - Total minutes
   * @returns {string} Formatted time string in HH:MM format
   * @example minutesToTime(870) returns '14:30'
   */
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  /**
   * Generates an array of time slots in 15-minute increments
   * Based on the working hours defined in the props
   *
   * @returns {string[]} Array of time slots as formatted strings
   * @example ['09:00', '09:15', '09:30', ...]
   */
  const generateTimeSlots = (): string[] => {
    const startMinutes = timeToMinutes(workingHours.start);
    const endMinutes = timeToMinutes(workingHours.end);
    const slots: string[] = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 15) {
      slots.push(minutesToTime(minutes));
    }

    return slots;
  };

  /**
   * Number of rows available in the timeline for task placement
   * Defines the maximum number of tasks that can be displayed simultaneously
   */
  const timeSlots = generateTimeSlots();
  const timelineRows = 5; // Maximum 5 rows for task placement

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
   * Memoized map of time slots to tasks
   * Optimizes performance by pre-computing task occupancy for each time slot
   *
   * Key features:
   * - Creates a mapping of time slots to tasks
   * - Handles tasks spanning multiple time slots
   * - Supports efficient conflict and task retrieval
   *
   * @returns {Map<string, Task[]>} Map of time slots to tasks
   */
  const timeSlotTaskMap = useMemo(() => {
    const map = new Map<string, Task[]>();

    timelineTasks.forEach((task) => {
      if (!task.position) return;

      const taskStart = timeToMinutes(task.position.startTime);
      const taskEnd = taskStart + task.duration * 15;

      // Add task to each 15-minute slot it occupies
      for (let time = taskStart; time < taskEnd; time += 15) {
        const timeSlot = minutesToTime(time);
        if (!map.has(timeSlot)) {
          map.set(timeSlot, []);
        }
        map.get(timeSlot)!.push(task);
      }
    });

    return map;
  }, [timelineTasks]);

  /**
   * Finds a task at a specific position (row and time slot)
   *
   * @param {number} row - The row to check
   * @param {string} timeSlot - The time slot to check
   * @returns {Task | null} The task at the specified position, or null if no task exists
   */
  const getTaskAtPosition = (row: number, timeSlot: string): Task | null => {
    return (
      timelineTasks.find((task) => {
        if (!task.position) return false;
        if (task.position.row !== row) return false;

        // Check if the time slot is within the task's time range
        const taskStart = timeToMinutes(task.position.startTime);
        const taskEnd = taskStart + task.duration * 15;
        const slotTime = timeToMinutes(timeSlot);

        return slotTime >= taskStart && slotTime < taskEnd;
      }) || null
    );
  };

  /**
   * Checks if a specific time slot has multiple tasks (conflict)
   *
   * @param {string} timeSlot - The time slot to check for conflicts
   * @returns {boolean} True if multiple tasks exist in the time slot, false otherwise
   */
  const checkTimeSlotConflict = (timeSlot: string): boolean => {
    const tasksInSlot = timeSlotTaskMap.get(timeSlot) || [];
    return tasksInSlot.length > 1;
  };

  /**
   * Retrieves all tasks in a specific time slot
   *
   * @param {string} timeSlot - The time slot to retrieve tasks for
   * @returns {Task[]} Array of tasks in the specified time slot
   */
  const getTasksInTimeSlot = (timeSlot: string): Task[] => {
    return timeSlotTaskMap.get(timeSlot) || [];
  };

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
      <h3>
        Timeline ({workingHours.start} - {workingHours.end})
      </h3>

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
            {timeSlots.map((timeSlot) => {
              // Determine task status and conflict information
              const taskAtPosition = getTaskAtPosition(rowIndex, timeSlot);
              const hasConflict = checkTimeSlotConflict(timeSlot);
              const isConflictSlot = hasConflict && taskAtPosition;
              const conflictingTasks = hasConflict
                ? getTasksInTimeSlot(timeSlot)
                : [];

              // Generate tooltip text for conflicting tasks
              const conflictTooltip = hasConflict
                ? `Conflict detected: ${conflictingTasks.map((task) => `"${task.name}" (Row ${task.position!.row + 1})`).join(', ')}`
                : '';

              return (
                <div
                  key={`${rowIndex}-${timeSlot}`}
                  // Dynamic CSS classes for slot state
                  className={`timeline-slot ${taskAtPosition ? 'occupied' : 'empty'} ${isConflictSlot ? 'conflict' : ''}`}
                  title={conflictTooltip}
                  // Drag and drop event handlers
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rowIndex, timeSlot)}
                >
                  {/* Render task card only at its start time */}
                  {taskAtPosition &&
                    timeSlot === taskAtPosition.position!.startTime && (
                      <TaskCard task={taskAtPosition} onClick={onTaskClick} />
                    )}

                  {/* Conflict indicator */}
                  {isConflictSlot && (
                    <div className="conflict-indicator">⚠️</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
