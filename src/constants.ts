/**
 * Application Constants
 *
 * Centralized numeric constants to eliminate magic numbers throughout the codebase.
 * Organized by functional domain for better maintainability and readability.
 */

// ================================
// Time Management Constants
// ================================

/**
 * Time slot increment in minutes
 * Used for timeline grid generation and task duration calculations
 */
export const TIME_SLOT_INCREMENT_MINUTES = 15;

/**
 * Number of minutes in an hour
 * Used for time conversion calculations
 */
export const MINUTES_PER_HOUR = 60;

/**
 * String padding length for time formatting
 * Used to ensure HH:MM format with leading zeros
 */
export const TIME_STRING_PADDING_LENGTH = 2;

/**
 * Default working hours configuration
 * Standard business hours for timeline display
 */
export const DEFAULT_WORKING_HOURS = {
  START: '09:00',
  END: '18:00',
} as const;

// ================================
// Task Management Constants
// ================================

/**
 * Default task duration in 15-minute increments
 * 2 units = 30 minutes (2 × 15 minutes)
 */
export const DEFAULT_TASK_DURATION_UNITS = 2;

/**
 * Minimum allowed task duration in 15-minute increments
 * 1 unit = 15 minutes
 */
export const MIN_TASK_DURATION_UNITS = 1;

/**
 * Maximum allowed task duration in 15-minute increments
 * 16 units = 4 hours (16 × 15 minutes)
 */
export const MAX_TASK_DURATION_UNITS = 16;

/**
 * Duration slider step increment
 * Allows precise control over task duration selection
 */
export const TASK_DURATION_STEP = 1;

// ================================
// Timeline Layout Constants
// ================================

/**
 * Maximum number of rows in the timeline
 * Defines how many parallel tasks can be displayed
 */
export const MAX_TIMELINE_ROWS = 5;

/**
 * Zero-based row indexing base
 * Used for consistent array indexing throughout the application
 */
export const ZERO_BASED_INDEX = 0;

/**
 * Array indexing offset for human-readable display
 * Converts 0-based index to 1-based display (e.g., Row 1, Row 2)
 */
export const DISPLAY_INDEX_OFFSET = 1;

// ================================
// Conflict Detection Constants
// ================================

/**
 * Minimum number of tasks required to constitute a conflict
 * More than one task in the same time slot creates a conflict
 */
export const CONFLICT_THRESHOLD = 1;

/**
 * Single task count (used for conflict summary generation)
 */
export const SINGLE_TASK_COUNT = 1;
