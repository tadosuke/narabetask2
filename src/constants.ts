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
 * Maximum allowed task duration in 15-minute increments
 * 16 units = 4 hours (16 × 15 minutes)
 */
export const MAX_TASK_DURATION_UNITS = 16;

// ================================
// Timeline Layout Constants
// ================================

/**
 * Maximum number of rows in the timeline
 * Defines how many parallel tasks can be displayed
 */
export const MAX_TIMELINE_ROWS = 5;
