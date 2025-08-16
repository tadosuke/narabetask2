import { describe, it, expect, vi } from 'vitest';
import { TaskService } from '../../../src/services/taskService';
import type { Task } from '../../../src/types';

// Mock timeToMinutes function
vi.mock('../../../src/utils/timeUtils', () => ({
  timeToMinutes: (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },
}));

describe('TaskService', () => {
  // Test data setup
  const createMockTask = (
    id: string,
    name: string,
    duration: number,
    position: { row: number; startTime: string } | null = null
  ): Task => ({
    id,
    name,
    duration,
    position,
  });

  const mockPoolTask = createMockTask('pool-1', 'Pool Task', 2);
  const mockTimelineTask = createMockTask('timeline-1', 'Timeline Task', 4, {
    row: 0,
    startTime: '09:00',
  });
  const mockAnotherTimelineTask = createMockTask(
    'timeline-2',
    'Another Timeline Task',
    2,
    {
      row: 1,
      startTime: '10:00',
    }
  );

  describe('createNewTask', () => {
    it('creates a new task with correct properties', () => {
      const existingTasks: Task[] = [];
      const newTask = TaskService.createNewTask(existingTasks);

      expect(newTask.id).toMatch(/^task-\d+$/);
      expect(newTask.name).toBe('タスク 1');
      expect(newTask.duration).toBe(2);
      expect(newTask.position).toBe(null);
    });

    it('creates tasks with incremental names based on existing task count', () => {
      const existingTasks = [mockPoolTask, mockTimelineTask];
      const newTask = TaskService.createNewTask(existingTasks);

      expect(newTask.name).toBe('タスク 3'); // 2 existing + 1 = 3
    });

    it('creates unique IDs for different tasks', () => {
      const existingTasks: Task[] = [];

      // Mock Date.now to return different values
      let mockTime = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime++);

      const task1 = TaskService.createNewTask(existingTasks);
      const task2 = TaskService.createNewTask(existingTasks);

      expect(task1.id).not.toBe(task2.id);
      expect(task1.id).toMatch(/^task-\d+$/);
      expect(task2.id).toMatch(/^task-\d+$/);

      vi.restoreAllMocks();
    });

    it('handles empty task list correctly', () => {
      const newTask = TaskService.createNewTask([]);
      expect(newTask.name).toBe('タスク 1');
    });

    it('handles large number of existing tasks', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) =>
        createMockTask(`task-${i}`, `Task ${i}`, 2)
      );
      const newTask = TaskService.createNewTask(largeTasks);
      expect(newTask.name).toBe('タスク 101');
    });
  });

  describe('updateTaskInList', () => {
    it('updates an existing task in the list', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const updatedTask = {
        ...mockPoolTask,
        name: 'Updated Pool Task',
        duration: 4,
      };
      const result = TaskService.updateTaskInList(tasks, updatedTask);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Updated Pool Task');
      expect(result[0].duration).toBe(4);
      expect(result[1]).toBe(mockTimelineTask); // unchanged
    });

    it('does not modify the original array', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const updatedTask = { ...mockPoolTask, name: 'Updated Pool Task' };
      const result = TaskService.updateTaskInList(tasks, updatedTask);

      expect(result).not.toBe(tasks);
      expect(tasks[0].name).toBe('Pool Task'); // original unchanged
    });

    it('returns the same list if task ID not found', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const nonExistentTask = createMockTask('non-existent', 'Non Existent', 2);
      const result = TaskService.updateTaskInList(tasks, nonExistentTask);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockPoolTask);
      expect(result[1]).toBe(mockTimelineTask);
    });

    it('handles empty task list', () => {
      const result = TaskService.updateTaskInList([], mockPoolTask);
      expect(result).toEqual([]);
    });

    it('updates multiple properties at once', () => {
      const tasks = [mockPoolTask];
      const updatedTask = {
        ...mockPoolTask,
        name: 'New Name',
        duration: 8,
        position: { row: 2, startTime: '14:00' },
      };
      const result = TaskService.updateTaskInList(tasks, updatedTask);

      expect(result[0].name).toBe('New Name');
      expect(result[0].duration).toBe(8);
      expect(result[0].position).toEqual({ row: 2, startTime: '14:00' });
    });
  });

  describe('deleteTaskFromList', () => {
    it('removes the specified task from the list', () => {
      const tasks = [mockPoolTask, mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.deleteTaskFromList(tasks, 'timeline-1');

      expect(result).toHaveLength(2);
      expect(result).toContain(mockPoolTask);
      expect(result).toContain(mockAnotherTimelineTask);
      expect(result).not.toContain(mockTimelineTask);
    });

    it('does not modify the original array', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.deleteTaskFromList(tasks, 'pool-1');

      expect(result).not.toBe(tasks);
      expect(tasks).toContain(mockPoolTask); // original unchanged
    });

    it('returns the same list if task ID not found', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.deleteTaskFromList(tasks, 'non-existent');

      expect(result).toHaveLength(2);
      expect(result).toContain(mockPoolTask);
      expect(result).toContain(mockTimelineTask);
    });

    it('handles empty task list', () => {
      const result = TaskService.deleteTaskFromList([], 'any-id');
      expect(result).toEqual([]);
    });

    it('handles deleting the only task in the list', () => {
      const tasks = [mockPoolTask];
      const result = TaskService.deleteTaskFromList(tasks, 'pool-1');
      expect(result).toEqual([]);
    });
  });

  describe('placeTaskOnTimeline', () => {
    it('places a task on the timeline with correct position', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.placeTaskOnTimeline(
        tasks,
        'pool-1',
        2,
        '14:30'
      );

      expect(result[0].position).toEqual({ row: 2, startTime: '14:30' });
      expect(result[1]).toBe(mockTimelineTask); // unchanged
    });

    it('does not modify the original array', () => {
      const tasks = [mockPoolTask];
      const result = TaskService.placeTaskOnTimeline(
        tasks,
        'pool-1',
        0,
        '09:00'
      );

      expect(result).not.toBe(tasks);
      expect(tasks[0].position).toBe(null); // original unchanged
    });

    it('returns the same list if task ID not found', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.placeTaskOnTimeline(
        tasks,
        'non-existent',
        0,
        '09:00'
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockPoolTask);
      expect(result[1]).toBe(mockTimelineTask);
    });

    it('overwrites existing position if task is already on timeline', () => {
      const tasks = [mockTimelineTask];
      const result = TaskService.placeTaskOnTimeline(
        tasks,
        'timeline-1',
        3,
        '16:00'
      );

      expect(result[0].position).toEqual({ row: 3, startTime: '16:00' });
    });

    it('handles edge case row and time values', () => {
      const tasks = [mockPoolTask];
      const result = TaskService.placeTaskOnTimeline(
        tasks,
        'pool-1',
        0,
        '00:00'
      );

      expect(result[0].position).toEqual({ row: 0, startTime: '00:00' });
    });
  });

  describe('returnTaskToPool', () => {
    it('moves a task from timeline back to pool', () => {
      const tasks = [mockTimelineTask, mockPoolTask];
      const result = TaskService.returnTaskToPool(tasks, 'timeline-1');

      expect(result[0].position).toBe(null);
      expect(result[1]).toBe(mockPoolTask); // unchanged
    });

    it('does not modify the original array', () => {
      const tasks = [mockTimelineTask];
      const result = TaskService.returnTaskToPool(tasks, 'timeline-1');

      expect(result).not.toBe(tasks);
      expect(tasks[0].position).toEqual({ row: 0, startTime: '09:00' }); // original unchanged
    });

    it('returns the same list if task ID not found', () => {
      const tasks = [mockTimelineTask, mockPoolTask];
      const result = TaskService.returnTaskToPool(tasks, 'non-existent');

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockTimelineTask);
      expect(result[1]).toBe(mockPoolTask);
    });

    it('handles task already in pool', () => {
      const tasks = [mockPoolTask];
      const result = TaskService.returnTaskToPool(tasks, 'pool-1');

      expect(result[0].position).toBe(null); // still null
    });
  });

  describe('checkTaskConflicts', () => {
    it('detects no conflicts when there are no overlapping tasks', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 2, { row: 0, startTime: '09:00' }), // 09:00-09:30
        createMockTask('task2', 'Task 2', 2, { row: 1, startTime: '10:00' }), // 10:00-10:30
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:30',
        2
      ); // 09:30-10:00

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingTasks).toHaveLength(0);
    });

    it('detects conflicts with same row tasks', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 0, startTime: '09:00' }), // 09:00-10:00
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:30',
        2
      ); // 09:30-10:00

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingTasks).toHaveLength(1);
      expect(result.conflictingTasks[0].task.id).toBe('task1');
      expect(result.conflictingTasks[0].conflictType).toBe('同一行重複');
    });

    it('detects conflicts with different row tasks', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 1, startTime: '09:00' }), // 09:00-10:00
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:30',
        2
      ); // 09:30-10:00

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingTasks).toHaveLength(1);
      expect(result.conflictingTasks[0].conflictType).toBe(
        '異なる行重複 (行2)'
      );
    });

    it('detects multiple conflicts correctly', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 0, startTime: '09:00' }), // 09:00-10:00
        createMockTask('task2', 'Task 2', 4, { row: 1, startTime: '09:15' }), // 09:15-10:15
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        2,
        '09:30',
        2
      ); // 09:30-10:00

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingTasks).toHaveLength(2);
    });

    it('ignores the task being checked itself', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 0, startTime: '09:00' }),
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'task1',
        0,
        '09:00',
        4
      );

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingTasks).toHaveLength(0);
    });

    it('ignores tasks in the pool (position === null)', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4), // in pool
        createMockTask('task2', 'Task 2', 4, { row: 0, startTime: '09:00' }),
      ];
      const result = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:30',
        2
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingTasks).toHaveLength(1);
      expect(result.conflictingTasks[0].task.id).toBe('task2');
    });

    it('correctly identifies overlap types', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 0, startTime: '09:30' }), // 09:30-10:30
      ];

      // Test different overlap scenarios
      const inclusiveResult = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:00',
        8
      ); // 09:00-11:00 (包含重複)
      expect(inclusiveResult.conflictingTasks[0].overlapType).toBe('包含重複');

      const containedResult = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:45',
        2
      ); // 09:45-10:15 (内包重複)
      expect(containedResult.conflictingTasks[0].overlapType).toBe('内包重複');

      const frontResult = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '09:00',
        3
      ); // 09:00-09:45 (前半重複)
      expect(frontResult.conflictingTasks[0].overlapType).toBe('前半重複');

      const backResult = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '10:00',
        3
      ); // 10:00-10:45 (後半重複)
      expect(backResult.conflictingTasks[0].overlapType).toBe('後半重複');
    });

    it('handles edge case timings correctly', () => {
      const tasks = [
        createMockTask('task1', 'Task 1', 4, { row: 0, startTime: '09:00' }), // 09:00-10:00
      ];

      // Task starting exactly when another ends - no conflict
      const noConflictResult = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '10:00',
        2
      );
      expect(noConflictResult.hasConflict).toBe(false);

      // Task ending exactly when another starts - no conflict
      const noConflictResult2 = TaskService.checkTaskConflicts(
        tasks,
        'new-task',
        0,
        '08:30',
        2
      );
      expect(noConflictResult2.hasConflict).toBe(false);
    });
  });

  describe('getPoolTasks', () => {
    it('returns only tasks with null position', () => {
      const tasks = [mockPoolTask, mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.getPoolTasks(tasks);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockPoolTask);
    });

    it('returns empty array when no tasks are in pool', () => {
      const tasks = [mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.getPoolTasks(tasks);

      expect(result).toEqual([]);
    });

    it('returns all tasks when all are in pool', () => {
      const poolTasks = [
        createMockTask('pool1', 'Pool Task 1', 2),
        createMockTask('pool2', 'Pool Task 2', 4),
      ];
      const result = TaskService.getPoolTasks(poolTasks);

      expect(result).toHaveLength(2);
      expect(result).toEqual(poolTasks);
    });

    it('handles empty task list', () => {
      const result = TaskService.getPoolTasks([]);
      expect(result).toEqual([]);
    });

    it('does not modify the original array', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.getPoolTasks(tasks);

      expect(result).not.toBe(tasks);
    });
  });

  describe('getTimelineTasks', () => {
    it('returns only tasks with non-null position', () => {
      const tasks = [mockPoolTask, mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.getTimelineTasks(tasks);

      expect(result).toHaveLength(2);
      expect(result).toContain(mockTimelineTask);
      expect(result).toContain(mockAnotherTimelineTask);
    });

    it('returns empty array when no tasks are on timeline', () => {
      const tasks = [mockPoolTask];
      const result = TaskService.getTimelineTasks(tasks);

      expect(result).toEqual([]);
    });

    it('returns all tasks when all are on timeline', () => {
      const timelineTasks = [mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.getTimelineTasks(timelineTasks);

      expect(result).toHaveLength(2);
      expect(result).toEqual(timelineTasks);
    });

    it('handles empty task list', () => {
      const result = TaskService.getTimelineTasks([]);
      expect(result).toEqual([]);
    });

    it('does not modify the original array', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.getTimelineTasks(tasks);

      expect(result).not.toBe(tasks);
    });
  });

  describe('findTaskById', () => {
    it('finds and returns the task with matching ID', () => {
      const tasks = [mockPoolTask, mockTimelineTask, mockAnotherTimelineTask];
      const result = TaskService.findTaskById(tasks, 'timeline-1');

      expect(result).toBe(mockTimelineTask);
    });

    it('returns null when task ID not found', () => {
      const tasks = [mockPoolTask, mockTimelineTask];
      const result = TaskService.findTaskById(tasks, 'non-existent');

      expect(result).toBe(null);
    });

    it('returns null when task list is empty', () => {
      const result = TaskService.findTaskById([], 'any-id');
      expect(result).toBe(null);
    });

    it('finds tasks regardless of their position state', () => {
      const tasks = [mockPoolTask, mockTimelineTask];

      const poolResult = TaskService.findTaskById(tasks, 'pool-1');
      const timelineResult = TaskService.findTaskById(tasks, 'timeline-1');

      expect(poolResult).toBe(mockPoolTask);
      expect(timelineResult).toBe(mockTimelineTask);
    });

    it('returns the first matching task if duplicates exist', () => {
      const duplicateTask = createMockTask('timeline-1', 'Duplicate', 2);
      const tasks = [mockTimelineTask, duplicateTask];
      const result = TaskService.findTaskById(tasks, 'timeline-1');

      expect(result).toBe(mockTimelineTask); // first one
    });
  });
});
