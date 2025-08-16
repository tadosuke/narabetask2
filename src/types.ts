/**
 * Represents a task in the task management system.
 * Tasks can be either placed in a task pool or positioned on a timeline.
 */
export interface Task {
  /**
   * Unique identifier for the task.
   * Generated automatically when a task is created.
   */
  id: string;

  /**
   * Name or description of the task.
   * Displayed to users to identify the task's purpose.
   */
  name: string;

  /**
   * Duration of the task in 15-minute increments.
   * Examples:
   * - 1 = 15 minutes
   * - 2 = 30 minutes
   * - 4 = 60 minutes
   */
  duration: number;

  /**
   * Position of the task on the timeline.
   * - If null, the task is in the task pool (not yet scheduled)
   * - When assigned, indicates the specific location on the timeline
   */
  position: Position | null;
}

/**
 * Defines the precise location of a task on the timeline.
 * Used to position tasks vertically and specify their start time.
 */
export interface Position {
  /**
   * Vertical row index on the timeline.
   * Starts from 0, representing different rows or tracks.
   */
  row: number;

  /**
   * Start time of the task in HH:MM format.
   * Examples: "09:00", "14:30"
   */
  startTime: string;
}

/**
 * Represents a generic time slot with a start and end time.
 * Used for defining time ranges in various contexts.
 */
export interface TimeSlot {
  /**
   * Start time of the time slot in HH:MM format.
   * Examples: "09:00", "14:30"
   */
  start: string;

  /**
   * End time of the time slot in HH:MM format.
   * Examples: "18:00", "22:15"
   */
  end: string;
}

/**
 * Defines the standard working hours for a day.
 * Used to set boundaries for task scheduling and availability.
 */
export interface WorkingHours {
  /**
   * Start of working hours in HH:MM format.
   * Represents when the workday begins.
   * Example: "09:00" for a 9 AM start
   */
  start: string;

  /**
   * End of working hours in HH:MM format.
   * Represents when the workday concludes.
   * Example: "18:00" for a 6 PM end
   */
  end: string;
}

/**
 * Defines the possible states of a task in the system.
 * - 'pool': Task is unscheduled and waiting in the task pool
 * - 'timeline': Task is scheduled and placed on the timeline
 */
export type TaskStatus = 'pool' | 'timeline';
