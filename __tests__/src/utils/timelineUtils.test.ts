import { describe, it, expect, vi } from 'vitest';
import { TimelineUtils } from '../../../src/utils/timelineUtils';
import type { Task } from '../../../src/types';

// Mock timeToMinutes function
vi.mock('../../../src/utils/timeUtils', () => ({
  timeToMinutes: (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },
}));

describe('TimelineUtils', () => {
  // Test data setup
  const createMockTask = (
    id: string,
    name: string,
    duration: number,
    row: number,
    startTime: string
  ): Task => ({
    id,
    name,
    duration,
    position: { row, startTime },
  });

  const createMockPoolTask = (
    id: string,
    name: string,
    duration: number
  ): Task => ({
    id,
    name,
    duration,
    position: null,
  });

  describe('getTaskAtPosition', () => {
    describe('Normal cases', () => {
      it('finds task at correct position and time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'), // 09:00-10:00, row 0
          createMockTask('task2', 'Task 2', 2, 1, '09:30'), // 09:30-10:00, row 1
          createMockTask('task3', 'Task 3', 2, 0, '10:15'), // 10:15-10:45, row 0
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:30');
        expect(result).toBe(tasks[0]); // task1 spans 09:00-10:00 at row 0
      });

      it('returns null when no task exists at position', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30, row 0
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '10:00');
        expect(result).toBe(null);
      });

      it('returns null when task is in different row', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'), // row 0
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 1, '09:30');
        expect(result).toBe(null);
      });

      it('finds task at exact start time', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:00');
        expect(result).toBe(tasks[0]);
      });

      it('returns null at exact end time', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:30');
        expect(result).toBe(null); // Time slot 09:30 is not covered by task ending at 09:30
      });
    });

    describe('Boundary values', () => {
      it('handles empty task list', () => {
        const result = TimelineUtils.getTaskAtPosition([], 0, '09:00');
        expect(result).toBe(null);
      });

      it('handles row 0 correctly', () => {
        const tasks = [createMockTask('task1', 'Task 1', 2, 0, '09:00')];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:15');
        expect(result).toBe(tasks[0]);
      });

      it('handles midnight times correctly', () => {
        const tasks = [
          createMockTask('task1', 'Midnight Task', 2, 0, '00:00'), // 00:00-00:30
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '00:15');
        expect(result).toBe(tasks[0]);
      });

      it('handles end of day times correctly', () => {
        const tasks = [
          createMockTask('task1', 'Late Task', 2, 0, '23:45'), // 23:45-00:00 (next day)
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '23:50');
        expect(result).toBe(tasks[0]);
      });
    });

    describe('Edge cases', () => {
      it('ignores tasks in pool (position === null)', () => {
        const tasks = [
          createMockPoolTask('pool1', 'Pool Task', 4),
          createMockTask('task1', 'Timeline Task', 2, 0, '09:00'),
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:15');
        expect(result).toBe(tasks[1]); // Finds timeline task, not pool task
      });

      it('returns first matching task if multiple tasks overlap at same position', () => {
        const tasks = [
          createMockTask('task1', 'First Task', 4, 0, '09:00'),
          createMockTask('task2', 'Second Task', 4, 0, '09:15'), // Overlapping at row 0
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:30');
        expect(result).toBe(tasks[0]); // First matching task
      });

      it('handles very long duration tasks', () => {
        const tasks = [
          createMockTask('task1', 'Long Task', 32, 0, '09:00'), // 8 hours
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '15:00');
        expect(result).toBe(tasks[0]);
      });

      it('handles single 15-minute task', () => {
        const tasks = [
          createMockTask('task1', 'Short Task', 1, 0, '09:00'), // 09:00-09:15
        ];

        const result = TimelineUtils.getTaskAtPosition(tasks, 0, '09:00');
        expect(result).toBe(tasks[0]);

        const resultAfter = TimelineUtils.getTaskAtPosition(tasks, 0, '09:15');
        expect(resultAfter).toBe(null);
      });

      it('correctly handles multiple rows with different tasks', () => {
        const tasks = [
          createMockTask('task1', 'Row 0 Task', 4, 0, '09:00'),
          createMockTask('task2', 'Row 1 Task', 4, 1, '09:00'),
          createMockTask('task3', 'Row 2 Task', 4, 2, '09:00'),
        ];

        expect(TimelineUtils.getTaskAtPosition(tasks, 0, '09:30')).toBe(
          tasks[0]
        );
        expect(TimelineUtils.getTaskAtPosition(tasks, 1, '09:30')).toBe(
          tasks[1]
        );
        expect(TimelineUtils.getTaskAtPosition(tasks, 2, '09:30')).toBe(
          tasks[2]
        );
      });
    });
  });

  describe('isTaskStartSlot', () => {
    describe('Normal cases', () => {
      it('returns true when time slot matches task start time', () => {
        const task = createMockTask('task1', 'Task 1', 4, 0, '09:00');
        const result = TimelineUtils.isTaskStartSlot(task, '09:00');
        expect(result).toBe(true);
      });

      it('returns false when time slot does not match task start time', () => {
        const task = createMockTask('task1', 'Task 1', 4, 0, '09:00');
        const result = TimelineUtils.isTaskStartSlot(task, '09:15');
        expect(result).toBe(false);
      });

      it('returns false for time slots within task duration but not start', () => {
        const task = createMockTask('task1', 'Task 1', 4, 0, '09:00'); // 09:00-10:00
        const result = TimelineUtils.isTaskStartSlot(task, '09:30');
        expect(result).toBe(false);
      });
    });

    describe('Boundary values', () => {
      it('handles midnight start time correctly', () => {
        const task = createMockTask('task1', 'Midnight Task', 2, 0, '00:00');
        expect(TimelineUtils.isTaskStartSlot(task, '00:00')).toBe(true);
        expect(TimelineUtils.isTaskStartSlot(task, '00:15')).toBe(false);
      });

      it('handles end of day start time correctly', () => {
        const task = createMockTask('task1', 'Late Task', 1, 0, '23:45');
        expect(TimelineUtils.isTaskStartSlot(task, '23:45')).toBe(true);
        expect(TimelineUtils.isTaskStartSlot(task, '23:30')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('returns false for task in pool (position === null)', () => {
        const task = createMockPoolTask('pool1', 'Pool Task', 4);
        const result = TimelineUtils.isTaskStartSlot(task, '09:00');
        expect(result).toBe(false);
      });

      it('handles various time formats correctly', () => {
        const task = createMockTask('task1', 'Task 1', 2, 0, '09:15');
        expect(TimelineUtils.isTaskStartSlot(task, '09:15')).toBe(true);
        expect(TimelineUtils.isTaskStartSlot(task, '09:00')).toBe(false);
        expect(TimelineUtils.isTaskStartSlot(task, '09:30')).toBe(false);
      });
    });
  });

  describe('createTimeSlotTaskMap', () => {
    describe('Normal cases', () => {
      it('creates correct mapping for single task', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30 (2 slots)
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(2);
        expect(result.get('09:00')).toEqual([tasks[0]]);
        expect(result.get('09:15')).toEqual([tasks[0]]);
        expect(result.get('09:30')).toBeUndefined();
      });

      it('creates correct mapping for multiple non-overlapping tasks', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
          createMockTask('task2', 'Task 2', 2, 1, '09:30'), // 09:30-10:00
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(4);
        expect(result.get('09:00')).toEqual([tasks[0]]);
        expect(result.get('09:15')).toEqual([tasks[0]]);
        expect(result.get('09:30')).toEqual([tasks[1]]);
        expect(result.get('09:45')).toEqual([tasks[1]]);
      });

      it('creates correct mapping for overlapping tasks', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'), // 09:00-10:00
          createMockTask('task2', 'Task 2', 2, 1, '09:15'), // 09:15-09:45
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.get('09:00')).toEqual([tasks[0]]);
        expect(result.get('09:15')).toEqual([tasks[0], tasks[1]]);
        expect(result.get('09:30')).toEqual([tasks[0], tasks[1]]);
        expect(result.get('09:45')).toEqual([tasks[0]]); // task2 ends here
      });

      it('handles tasks with different durations correctly', () => {
        const tasks = [
          createMockTask('task1', 'Short Task', 1, 0, '09:00'), // 09:00-09:15
          createMockTask('task2', 'Long Task', 8, 1, '09:00'), // 09:00-11:00
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.get('09:00')).toEqual([tasks[0], tasks[1]]);
        expect(result.get('09:15')).toEqual([tasks[1]]); // only long task continues
        expect(result.get('10:45')).toEqual([tasks[1]]);
        expect(result.get('11:00')).toBeUndefined(); // both tasks end
      });
    });

    describe('Boundary values', () => {
      it('returns empty map for empty task list', () => {
        const result = TimelineUtils.createTimeSlotTaskMap([]);
        expect(result.size).toBe(0);
      });

      it('handles tasks with zero duration', () => {
        const tasks = [createMockTask('task1', 'Zero Duration', 0, 0, '09:00')];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);
        expect(result.size).toBe(0); // No time slots covered
      });

      it('handles single 15-minute task correctly', () => {
        const tasks = [
          createMockTask('task1', 'Minimal Task', 1, 0, '09:00'), // 09:00-09:15
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(1);
        expect(result.get('09:00')).toEqual([tasks[0]]);
        expect(result.get('09:15')).toBeUndefined();
      });
    });

    describe('Edge cases', () => {
      it('ignores tasks in pool (position === null)', () => {
        const tasks = [
          createMockPoolTask('pool1', 'Pool Task', 4),
          createMockTask('task1', 'Timeline Task', 2, 0, '09:00'),
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(2);
        expect(result.get('09:00')).toEqual([tasks[1]]);
        expect(result.get('09:15')).toEqual([tasks[1]]);
      });

      it('handles tasks with very long durations', () => {
        const tasks = [
          createMockTask('task1', 'Very Long Task', 96, 0, '00:00'), // 24 hours
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(96); // 24 hours * 4 slots per hour
        expect(result.get('00:00')).toEqual([tasks[0]]);
        expect(result.get('12:00')).toEqual([tasks[0]]);
        expect(result.get('23:45')).toEqual([tasks[0]]);
      });

      it('preserves task order in arrays for same time slots', () => {
        const tasks = [
          createMockTask('task1', 'First', 2, 0, '09:00'),
          createMockTask('task2', 'Second', 2, 1, '09:00'),
          createMockTask('task3', 'Third', 2, 2, '09:00'),
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        const slot = result.get('09:00');
        expect(slot).toHaveLength(3);
        expect(slot![0]).toBe(tasks[0]);
        expect(slot![1]).toBe(tasks[1]);
        expect(slot![2]).toBe(tasks[2]);
      });

      it('handles midnight crossing correctly', () => {
        const tasks = [
          createMockTask('task1', 'Late Night', 2, 0, '23:45'), // 23:45-00:00 (next day)
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(2);
        expect(result.get('23:45')).toEqual([tasks[0]]);
        expect(result.get('23:59')).toBeUndefined(); // Only 15-minute increments
        // Note: The next slot would be 00:00, but that's the next day
      });

      it('handles complex overlapping scenario', () => {
        const tasks = [
          createMockTask('task1', 'Base Task', 8, 0, '09:00'), // 09:00-11:00
          createMockTask('task2', 'Early Overlap', 3, 1, '09:15'), // 09:15-10:00
          createMockTask('task3', 'Late Overlap', 3, 2, '10:15'), // 10:15-11:00
          createMockTask('task4', 'Full Overlap', 6, 3, '09:30'), // 09:30-11:00
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        // Check specific time slots
        expect(result.get('09:00')).toEqual([tasks[0]]);
        expect(result.get('09:30')).toEqual([tasks[0], tasks[1], tasks[3]]);
        expect(result.get('10:00')).toEqual([tasks[0], tasks[3]]);
        expect(result.get('10:30')).toEqual([tasks[0], tasks[2], tasks[3]]);
      });
    });

    describe('Performance considerations', () => {
      it('handles large number of tasks efficiently', () => {
        const tasks = Array.from({ length: 100 }, (_, i) =>
          createMockTask(`task${i}`, `Task ${i}`, 2, i % 10, '09:00')
        );

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        expect(result.size).toBe(2); // All tasks have same time slots
        expect(result.get('09:00')).toHaveLength(100);
        expect(result.get('09:15')).toHaveLength(100);
      });

      it('creates separate arrays for each time slot (no reference sharing)', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'), // Spans multiple slots
        ];

        const result = TimelineUtils.createTimeSlotTaskMap(tasks);

        const slot1 = result.get('09:00');
        const slot2 = result.get('09:15');

        expect(slot1).not.toBe(slot2); // Different array instances
        expect(slot1).toEqual(slot2); // Same content
      });
    });
  });
});
