import { describe, it, expect, vi } from 'vitest';
import { ConflictService } from '../../../src/services/conflictService';
import type { Task } from '../../../src/types';

// Mock the utility functions
vi.mock('../../../src/utils/timeUtils', () => ({
  timeToMinutes: (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },
  formatDuration: (duration: number): string => {
    const totalMinutes = duration * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}時間${minutes}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${minutes}分`;
    }
  },
}));

describe('ConflictService', () => {
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

  describe('generateConflictMessage', () => {
    describe('Normal cases', () => {
      it('generates correct message for single conflict', () => {
        const conflictingTask = createMockTask(
          'task1',
          'Meeting with Client',
          4,
          0,
          '09:00'
        );
        const conflictingTasks = [
          {
            task: conflictingTask,
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);

        expect(result).toContain('1つのタスクと重複');
        expect(result).toContain('Meeting with Client');
        expect(result).toContain('09:00開始');
        expect(result).toContain('1時間');
        expect(result).toContain('同一行重複');
        expect(result).toContain('部分重複');
        expect(result).toContain('別の時間帯または行に配置してください');
      });

      it('generates correct message for multiple conflicts', () => {
        const task1 = createMockTask('task1', 'Meeting A', 2, 0, '09:00');
        const task2 = createMockTask('task2', 'Meeting B', 3, 1, '09:15');
        const conflictingTasks = [
          {
            task: task1,
            conflictType: '同一行重複',
            overlapType: '前半重複',
          },
          {
            task: task2,
            conflictType: '異なる行重複 (行2)',
            overlapType: '後半重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);

        expect(result).toContain('2つのタスクと重複');
        expect(result).toContain('Meeting A');
        expect(result).toContain('Meeting B');
        expect(result).toContain('09:00開始');
        expect(result).toContain('09:15開始');
        expect(result).toContain('30分');
        expect(result).toContain('45分');
      });

      it('correctly formats different duration formats', () => {
        const task1 = createMockTask('task1', 'Task 1', 1, 0, '09:00'); // 15分
        const task2 = createMockTask('task2', 'Task 2', 4, 0, '10:00'); // 1時間
        const task3 = createMockTask('task3', 'Task 3', 5, 0, '11:00'); // 1時間15分

        const conflictingTasks1 = [
          { task: task1, conflictType: '同一行重複', overlapType: '部分重複' },
        ];
        const conflictingTasks2 = [
          { task: task2, conflictType: '同一行重複', overlapType: '部分重複' },
        ];
        const conflictingTasks3 = [
          { task: task3, conflictType: '同一行重複', overlapType: '部分重複' },
        ];

        expect(
          ConflictService.generateConflictMessage(conflictingTasks1)
        ).toContain('15分');
        expect(
          ConflictService.generateConflictMessage(conflictingTasks2)
        ).toContain('1時間');
        expect(
          ConflictService.generateConflictMessage(conflictingTasks3)
        ).toContain('1時間15分');
      });
    });

    describe('Edge cases', () => {
      it('handles tasks with special characters in names', () => {
        const task = createMockTask(
          'task1',
          'タスク【重要】(緊急)',
          2,
          0,
          '09:00'
        );
        const conflictingTasks = [
          {
            task,
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);
        expect(result).toContain('タスク【重要】(緊急)');
      });

      it('handles very long task names', () => {
        const longName =
          'Very Long Task Name That Exceeds Normal Length Expectations';
        const task = createMockTask('task1', longName, 2, 0, '09:00');
        const conflictingTasks = [
          {
            task,
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);
        expect(result).toContain(longName);
      });

      it('handles large number of conflicts', () => {
        const conflictingTasks = Array.from({ length: 10 }, (_, i) => ({
          task: createMockTask(`task${i}`, `Task ${i}`, 2, i, '09:00'),
          conflictType: `異なる行重複 (行${i + 1})`,
          overlapType: '部分重複',
        }));

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);
        expect(result).toContain('10つのタスクと重複');
        expect(result).toContain('Task 0');
        expect(result).toContain('Task 9');
      });
    });

    describe('Message formatting', () => {
      it('includes all required message components', () => {
        const task = createMockTask('task1', 'Test Task', 2, 0, '09:00');
        const conflictingTasks = [
          {
            task,
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);

        expect(result).toContain('タスクの時間が重複しています');
        expect(result).toContain('1つのタスクと重複');
        expect(result).toContain('・同一行重複:');
        expect(result).toContain('別の時間帯または行に配置してください');
      });

      it('formats message with proper line breaks', () => {
        const task = createMockTask('task1', 'Test Task', 2, 0, '09:00');
        const conflictingTasks = [
          {
            task,
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ];

        const result =
          ConflictService.generateConflictMessage(conflictingTasks);

        expect(result.split('\n')).toHaveLength(5); // Expected number of lines
        expect(result).toContain('\n\n・');
        expect(result).toContain('\n\n別の時間帯または行に配置してください');
      });
    });
  });

  describe('getTasksInTimeSlot', () => {
    describe('Normal cases', () => {
      it('returns tasks that cover the specified time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'), // 09:00-10:00
          createMockTask('task2', 'Task 2', 2, 1, '09:30'), // 09:30-10:00
          createMockTask('task3', 'Task 3', 2, 2, '10:15'), // 10:15-10:45
          createMockPoolTask('pool1', 'Pool Task', 2), // in pool
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:45');

        expect(result).toHaveLength(2);
        expect(result.map((t) => t.id)).toContain('task1');
        expect(result.map((t) => t.id)).toContain('task2');
        expect(result.map((t) => t.id)).not.toContain('task3');
        expect(result.map((t) => t.id)).not.toContain('pool1');
      });

      it('returns tasks that start at the specified time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:00');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task1');
      });

      it('excludes tasks that end at the specified time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:30');
        expect(result).toHaveLength(0);
      });
    });

    describe('Boundary values', () => {
      it('handles tasks starting at midnight', () => {
        const tasks = [
          createMockTask('task1', 'Midnight Task', 2, 0, '00:00'), // 00:00-00:30
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '00:15');
        expect(result).toHaveLength(1);
      });

      it('handles tasks near end of day', () => {
        const tasks = [
          createMockTask('task1', 'Late Task', 2, 0, '23:45'), // 23:45-00:00 (next day)
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '23:50');
        expect(result).toHaveLength(1);
      });

      it('returns empty array for empty task list', () => {
        const result = ConflictService.getTasksInTimeSlot([], '09:00');
        expect(result).toEqual([]);
      });

      it('returns empty array when no tasks match the time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
          createMockTask('task2', 'Task 2', 2, 1, '10:00'), // 10:00-10:30
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:45');
        expect(result).toEqual([]);
      });
    });

    describe('Edge cases', () => {
      it('excludes tasks in pool (position === null)', () => {
        const tasks = [
          createMockPoolTask('pool1', 'Pool Task', 4),
          createMockTask('task1', 'Timeline Task', 2, 0, '09:00'),
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:15');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task1');
      });

      it('handles tasks with very long durations', () => {
        const tasks = [
          createMockTask('task1', 'Long Task', 32, 0, '09:00'), // 09:00-17:00 (8 hours)
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '13:00');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task1');
      });

      it('handles multiple overlapping tasks in different rows', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'),
          createMockTask('task2', 'Task 2', 4, 1, '09:00'),
          createMockTask('task3', 'Task 3', 4, 2, '09:00'),
        ];

        const result = ConflictService.getTasksInTimeSlot(tasks, '09:30');
        expect(result).toHaveLength(3);
      });
    });
  });

  describe('hasTimeSlotConflict', () => {
    describe('Normal cases', () => {
      it('returns true when multiple tasks exist in the same time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'),
          createMockTask('task2', 'Task 2', 4, 1, '09:00'),
        ];

        const result = ConflictService.hasTimeSlotConflict(tasks, '09:30');
        expect(result).toBe(true);
      });

      it('returns false when only one task exists in the time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'),
          createMockTask('task2', 'Task 2', 4, 1, '10:00'),
        ];

        const result = ConflictService.hasTimeSlotConflict(tasks, '09:30');
        expect(result).toBe(false);
      });

      it('returns false when no tasks exist in the time slot', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'),
          createMockTask('task2', 'Task 2', 2, 1, '10:00'),
        ];

        const result = ConflictService.hasTimeSlotConflict(tasks, '09:45');
        expect(result).toBe(false);
      });
    });

    describe('Boundary values', () => {
      it('returns false for empty task list', () => {
        const result = ConflictService.hasTimeSlotConflict([], '09:00');
        expect(result).toBe(false);
      });

      it('correctly handles tasks at time slot boundaries', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'), // 09:00-09:30
          createMockTask('task2', 'Task 2', 2, 1, '09:30'), // 09:30-10:00
        ];

        // At 09:30, task1 ends and task2 starts - no conflict
        const result = ConflictService.hasTimeSlotConflict(tasks, '09:30');
        expect(result).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('handles three or more conflicting tasks', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 4, 0, '09:00'),
          createMockTask('task2', 'Task 2', 4, 1, '09:00'),
          createMockTask('task3', 'Task 3', 4, 2, '09:00'),
        ];

        const result = ConflictService.hasTimeSlotConflict(tasks, '09:30');
        expect(result).toBe(true);
      });

      it('ignores pool tasks when checking conflicts', () => {
        const tasks = [
          createMockTask('task1', 'Timeline Task', 4, 0, '09:00'),
          createMockPoolTask('pool1', 'Pool Task', 4),
        ];

        const result = ConflictService.hasTimeSlotConflict(tasks, '09:30');
        expect(result).toBe(false);
      });
    });
  });

  describe('generateConflictTooltip', () => {
    describe('Normal cases', () => {
      it('generates correct tooltip for multiple conflicting tasks', () => {
        const tasks = [
          createMockTask('task1', 'Meeting A', 4, 0, '09:00'),
          createMockTask('task2', 'Meeting B', 4, 1, '09:00'),
        ];

        const result = ConflictService.generateConflictTooltip(tasks, '09:30');

        expect(result).toContain('Conflict detected:');
        expect(result).toContain('Meeting A');
        expect(result).toContain('Meeting B');
        expect(result).toContain('Row 1');
        expect(result).toContain('Row 2');
      });

      it('returns empty string when no conflict exists', () => {
        const tasks = [
          createMockTask('task1', 'Task 1', 2, 0, '09:00'),
          createMockTask('task2', 'Task 2', 2, 1, '10:00'),
        ];

        const result = ConflictService.generateConflictTooltip(tasks, '09:45');
        expect(result).toBe('');
      });

      it('handles single task (no conflict)', () => {
        const tasks = [createMockTask('task1', 'Single Task', 4, 0, '09:00')];

        const result = ConflictService.generateConflictTooltip(tasks, '09:30');
        expect(result).toBe('');
      });
    });

    describe('Edge cases', () => {
      it('handles tasks with special characters in names', () => {
        const tasks = [
          createMockTask('task1', 'Task "Special" & More', 4, 0, '09:00'),
          createMockTask('task2', 'Task <HTML> Tags', 4, 1, '09:00'),
        ];

        const result = ConflictService.generateConflictTooltip(tasks, '09:30');
        expect(result).toContain('Task "Special" & More');
        expect(result).toContain('Task <HTML> Tags');
      });

      it('returns empty string for empty task list', () => {
        const result = ConflictService.generateConflictTooltip([], '09:00');
        expect(result).toBe('');
      });

      it('handles many conflicting tasks', () => {
        const tasks = Array.from({ length: 5 }, (_, i) =>
          createMockTask(`task${i}`, `Task ${i}`, 4, i, '09:00')
        );

        const result = ConflictService.generateConflictTooltip(tasks, '09:30');
        expect(result).toContain('Conflict detected:');
        expect(result).toContain('Task 0');
        expect(result).toContain('Task 4');
      });

      it('correctly displays row numbers (1-indexed)', () => {
        const tasks = [
          createMockTask('task1', 'Task A', 4, 0, '09:00'), // Row 0 -> display as Row 1
          createMockTask('task2', 'Task B', 4, 2, '09:00'), // Row 2 -> display as Row 3
        ];

        const result = ConflictService.generateConflictTooltip(tasks, '09:30');
        expect(result).toContain('Row 1');
        expect(result).toContain('Row 3');
      });
    });

    describe('Integration with other methods', () => {
      it('correctly uses hasTimeSlotConflict to determine if tooltip should be generated', () => {
        const tasks = [createMockTask('task1', 'Task 1', 2, 0, '09:00')];

        // No conflict case
        const noConflictResult = ConflictService.generateConflictTooltip(
          tasks,
          '09:30'
        );
        expect(noConflictResult).toBe('');

        // Add conflicting task
        tasks.push(createMockTask('task2', 'Task 2', 2, 1, '09:00'));

        // Now conflict exists
        const conflictResult = ConflictService.generateConflictTooltip(
          tasks,
          '09:15'
        );
        expect(conflictResult).not.toBe('');
        expect(conflictResult).toContain('Conflict detected:');
      });
    });
  });
});
