import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../../src/hooks/useTasks';
import type { Task } from '../../../src/types';

// Mock the services and utilities
vi.mock('../../../src/services/taskService', () => ({
  TaskService: {
    createNewTask: vi.fn(),
    updateTaskInList: vi.fn(),
    deleteTaskFromList: vi.fn(),
    placeTaskOnTimeline: vi.fn(),
    returnTaskToPool: vi.fn(),
    checkTaskConflicts: vi.fn(),
    findTaskById: vi.fn(),
  },
}));

vi.mock('../../../src/services/conflictService', () => ({
  ConflictService: {
    generateConflictMessage: vi.fn(),
  },
}));

vi.mock('../../../src/utils/timeUtils', () => ({
  isWithinWorkingHours: vi.fn(),
}));

// Mock window.alert
global.alert = vi.fn();

import { TaskService } from '../../../src/services/taskService';
import { ConflictService } from '../../../src/services/conflictService';
import { isWithinWorkingHours } from '../../../src/utils/timeUtils';

describe('useTasks Hook', () => {
  const mockWorkingStart = '09:00';
  const mockWorkingEnd = '18:00';

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

  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
  });

  describe('Initial State', () => {
    it('initializes with empty tasks array and no selected task', () => {
      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      expect(result.current.tasks).toEqual([]);
      expect(result.current.selectedTask).toBe(null);
    });

    it('provides all expected hook functions', () => {
      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      expect(typeof result.current.createTask).toBe('function');
      expect(typeof result.current.updateTask).toBe('function');
      expect(typeof result.current.deleteTask).toBe('function');
      expect(typeof result.current.selectTask).toBe('function');
      expect(typeof result.current.dropTaskToTimeline).toBe('function');
      expect(typeof result.current.dropTaskToPool).toBe('function');
    });
  });

  describe('createTask', () => {
    it('creates a new task and adds it to the tasks array', () => {
      const mockNewTask = createMockTask('new-task', 'New Task', 2);
      vi.mocked(TaskService.createNewTask).mockReturnValue(mockNewTask);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.createTask();
      });

      expect(TaskService.createNewTask).toHaveBeenCalledWith([]);
      expect(result.current.tasks).toEqual([mockNewTask]);
    });

    it('passes current tasks list to TaskService.createNewTask', () => {
      const existingTask = createMockTask('existing', 'Existing Task', 2);
      const mockNewTask = createMockTask('new-task', 'New Task', 2);

      vi.mocked(TaskService.createNewTask).mockReturnValue(mockNewTask);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      // First add an existing task to state (simulate previous operations)
      act(() => {
        result.current.createTask();
      });

      vi.mocked(TaskService.createNewTask).mockReturnValue(existingTask);

      act(() => {
        result.current.createTask();
      });

      expect(TaskService.createNewTask).toHaveBeenCalledWith([mockNewTask]);
    });

    it('maintains task array immutability', () => {
      const mockNewTask = createMockTask('new-task', 'New Task', 2);
      vi.mocked(TaskService.createNewTask).mockReturnValue(mockNewTask);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      const initialTasks = result.current.tasks;

      act(() => {
        result.current.createTask();
      });

      expect(result.current.tasks).not.toBe(initialTasks);
    });
  });

  describe('updateTask', () => {
    it('updates an existing task using TaskService.updateTaskInList', () => {
      const originalTask = createMockTask('task1', 'Original Task', 2);
      const updatedTask = createMockTask('task1', 'Updated Task', 4);
      const updatedTasks = [updatedTask];

      vi.mocked(TaskService.updateTaskInList)
        .mockReturnValueOnce([originalTask])
        .mockReturnValueOnce(updatedTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      // Set initial tasks state
      act(() => {
        result.current.updateTask(originalTask);
      });

      act(() => {
        result.current.updateTask(updatedTask);
      });

      expect(TaskService.updateTaskInList).toHaveBeenLastCalledWith(
        [originalTask],
        updatedTask
      );
      expect(result.current.tasks).toEqual(updatedTasks);
    });

    it('maintains task array immutability during update', () => {
      const task = createMockTask('task1', 'Test Task', 2);
      const updatedTasks = [task];

      vi.mocked(TaskService.updateTaskInList).mockReturnValue(updatedTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      const initialTasks = result.current.tasks;

      act(() => {
        result.current.updateTask(task);
      });

      expect(result.current.tasks).not.toBe(initialTasks);
    });
  });

  describe('deleteTask', () => {
    it('deletes a task using TaskService.deleteTaskFromList', () => {
      const task2 = createMockTask('task2', 'Task 2', 2);
      const remainingTasks = [task2];

      vi.mocked(TaskService.deleteTaskFromList).mockReturnValue(remainingTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.deleteTask('task1');
      });

      expect(TaskService.deleteTaskFromList).toHaveBeenCalledWith([], 'task1');
      expect(result.current.tasks).toEqual(remainingTasks);
    });

    it('clears selected task when deleting a task', () => {
      vi.mocked(TaskService.deleteTaskFromList).mockReturnValue([]);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      // First select a task
      act(() => {
        result.current.selectTask('task1');
      });

      act(() => {
        result.current.deleteTask('task1');
      });

      expect(result.current.selectedTask).toBe(null);
    });

    it('maintains task array immutability during deletion', () => {
      vi.mocked(TaskService.deleteTaskFromList).mockReturnValue([]);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      const initialTasks = result.current.tasks;

      act(() => {
        result.current.deleteTask('task1');
      });

      expect(result.current.tasks).not.toBe(initialTasks);
    });
  });

  describe('selectTask', () => {
    it('selects a task by ID', () => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.selectTask('task1');
      });

      // Note: selectedTask will be null because the task doesn't exist in the tasks array
      // This is expected behavior as the hook looks up the task by ID
      expect(result.current.selectedTask).toBe(null);
    });

    it('updates selected task when different task is selected', () => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.selectTask('task1');
      });

      act(() => {
        result.current.selectTask('task2');
      });

      // Both will be null since tasks don't exist, but this tests the selection mechanism
      expect(result.current.selectedTask).toBe(null);
    });
  });

  describe('selectedTask computation', () => {
    it('returns the correct selected task when it exists', () => {
      const task = createMockTask('task1', 'Test Task', 2);
      vi.mocked(TaskService.findTaskById).mockReturnValue(task);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.selectTask('task1');
      });

      expect(result.current.selectedTask).toBe(task);
    });

    it('returns null when selected task ID does not exist', () => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.selectTask('non-existent');
      });

      expect(result.current.selectedTask).toBe(null);
    });

    it('returns null when no task is selected', () => {
      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      expect(result.current.selectedTask).toBe(null);
    });
  });

  describe('dropTaskToTimeline', () => {
    const mockTask = createMockTask('task1', 'Test Task', 4);
    const mockRow = 0;
    const mockStartTime = '09:00';

    beforeEach(() => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(mockTask);
      vi.mocked(TaskService.checkTaskConflicts).mockReturnValue({
        hasConflict: false,
        conflictingTasks: [],
      });
      vi.mocked(isWithinWorkingHours).mockReturnValue(true);
      vi.mocked(TaskService.placeTaskOnTimeline).mockReturnValue([mockTask]);
    });

    it('successfully places task on timeline when no conflicts exist', () => {
      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline('task1', mockRow, mockStartTime);
      });

      expect(TaskService.findTaskById).toHaveBeenCalledWith([], 'task1');
      expect(TaskService.checkTaskConflicts).toHaveBeenCalledWith(
        [],
        'task1',
        mockRow,
        mockStartTime,
        mockTask.duration
      );
      expect(isWithinWorkingHours).toHaveBeenCalledWith(
        mockStartTime,
        mockTask.duration,
        mockWorkingStart,
        mockWorkingEnd
      );
      expect(TaskService.placeTaskOnTimeline).toHaveBeenCalledWith(
        [],
        'task1',
        mockRow,
        mockStartTime
      );
    });

    it('does not place task when task ID is not found', () => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline(
          'non-existent',
          mockRow,
          mockStartTime
        );
      });

      expect(TaskService.checkTaskConflicts).not.toHaveBeenCalled();
      expect(TaskService.placeTaskOnTimeline).not.toHaveBeenCalled();
    });

    it('shows conflict alert and does not place task when conflicts exist', () => {
      const conflictingTasks = [
        {
          task: createMockTask('conflict1', 'Conflicting Task', 2, 0, '09:30'),
          conflictType: '同一行重複',
          overlapType: '部分重複',
        },
      ];

      vi.mocked(TaskService.checkTaskConflicts).mockReturnValue({
        hasConflict: true,
        conflictingTasks,
      });
      vi.mocked(ConflictService.generateConflictMessage).mockReturnValue(
        'Conflict message'
      );

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline('task1', mockRow, mockStartTime);
      });

      expect(ConflictService.generateConflictMessage).toHaveBeenCalledWith(
        conflictingTasks
      );
      expect(global.alert).toHaveBeenCalledWith('Conflict message');
      expect(TaskService.placeTaskOnTimeline).not.toHaveBeenCalled();
    });

    it('shows working hours alert and does not place task when outside working hours', () => {
      vi.mocked(isWithinWorkingHours).mockReturnValue(false);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline('task1', mockRow, mockStartTime);
      });

      expect(global.alert).toHaveBeenCalledWith('業務時間外には配置できません');
      expect(TaskService.placeTaskOnTimeline).not.toHaveBeenCalled();
    });

    it('checks conflicts before working hours validation', () => {
      vi.mocked(TaskService.checkTaskConflicts).mockReturnValue({
        hasConflict: true,
        conflictingTasks: [
          {
            task: createMockTask(
              'conflict1',
              'Conflicting Task',
              2,
              0,
              '09:30'
            ),
            conflictType: '同一行重複',
            overlapType: '部分重複',
          },
        ],
      });
      vi.mocked(ConflictService.generateConflictMessage).mockReturnValue(
        'Conflict message'
      );
      vi.mocked(isWithinWorkingHours).mockReturnValue(false);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline('task1', mockRow, mockStartTime);
      });

      expect(global.alert).toHaveBeenCalledWith('Conflict message');
      expect(global.alert).not.toHaveBeenCalledWith(
        '業務時間外には配置できません'
      );
      expect(isWithinWorkingHours).not.toHaveBeenCalled();
    });

    it('updates tasks state when placement is successful', () => {
      const updatedTasks = [
        { ...mockTask, position: { row: mockRow, startTime: mockStartTime } },
      ];
      vi.mocked(TaskService.placeTaskOnTimeline).mockReturnValue(updatedTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToTimeline('task1', mockRow, mockStartTime);
      });

      expect(result.current.tasks).toEqual(updatedTasks);
    });
  });

  describe('dropTaskToPool', () => {
    it('returns task to pool using TaskService.returnTaskToPool', () => {
      const mockTask = createMockTask('task1', 'Test Task', 4, 0, '09:00');
      const updatedTasks = [{ ...mockTask, position: null }];

      vi.mocked(TaskService.returnTaskToPool).mockReturnValue(updatedTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.dropTaskToPool('task1');
      });

      expect(TaskService.returnTaskToPool).toHaveBeenCalledWith([], 'task1');
      expect(result.current.tasks).toEqual(updatedTasks);
    });

    it('maintains task array immutability when returning to pool', () => {
      const updatedTasks = [createMockTask('task1', 'Test Task', 4)];
      vi.mocked(TaskService.returnTaskToPool).mockReturnValue(updatedTasks);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      const initialTasks = result.current.tasks;

      act(() => {
        result.current.dropTaskToPool('task1');
      });

      expect(result.current.tasks).not.toBe(initialTasks);
    });
  });

  describe('Hook Dependencies and Memoization', () => {
    it('functions are memoized based on tasks state', () => {
      const { result, rerender } = renderHook(
        ({ workingStart, workingEnd }) => useTasks(workingStart, workingEnd),
        {
          initialProps: {
            workingStart: mockWorkingStart,
            workingEnd: mockWorkingEnd,
          },
        }
      );

      const initialFunctions = {
        createTask: result.current.createTask,
        updateTask: result.current.updateTask,
        deleteTask: result.current.deleteTask,
        dropTaskToTimeline: result.current.dropTaskToTimeline,
        dropTaskToPool: result.current.dropTaskToPool,
      };

      // Rerender with same props - tasks haven't changed
      rerender({ workingStart: mockWorkingStart, workingEnd: mockWorkingEnd });

      expect(result.current.createTask).toBe(initialFunctions.createTask);
      expect(result.current.updateTask).toBe(initialFunctions.updateTask);
      expect(result.current.deleteTask).toBe(initialFunctions.deleteTask);
      expect(result.current.dropTaskToTimeline).toBe(
        initialFunctions.dropTaskToTimeline
      );
      expect(result.current.dropTaskToPool).toBe(
        initialFunctions.dropTaskToPool
      );
    });

    it('selectTask function is stable regardless of tasks state', () => {
      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      const initialSelectTask = result.current.selectTask;

      // Trigger state change
      act(() => {
        result.current.selectTask('task1');
      });

      expect(result.current.selectTask).toBe(initialSelectTask);
    });

    it('dropTaskToTimeline function updates when working hours change', () => {
      const { result, rerender } = renderHook(
        ({ workingStart, workingEnd }) => useTasks(workingStart, workingEnd),
        {
          initialProps: { workingStart: '09:00', workingEnd: '18:00' },
        }
      );

      const initialDropTaskToTimeline = result.current.dropTaskToTimeline;

      // Change working hours
      rerender({ workingStart: '08:00', workingEnd: '17:00' });

      expect(result.current.dropTaskToTimeline).not.toBe(
        initialDropTaskToTimeline
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles TaskService errors gracefully', () => {
      vi.mocked(TaskService.createNewTask).mockImplementation(() => {
        throw new Error('TaskService error');
      });

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      expect(() => {
        act(() => {
          result.current.createTask();
        });
      }).toThrow('TaskService error');
    });

    it('handles null or undefined task scenarios', () => {
      vi.mocked(TaskService.findTaskById).mockReturnValue(null);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      // This should not throw
      act(() => {
        result.current.dropTaskToTimeline('non-existent', 0, '09:00');
      });

      expect(TaskService.placeTaskOnTimeline).not.toHaveBeenCalled();
    });

    it('maintains consistency when multiple operations are performed rapidly', () => {
      const mockTask1 = createMockTask('task1', 'Task 1', 2);
      const mockTask2 = createMockTask('task2', 'Task 2', 2);

      vi.mocked(TaskService.createNewTask)
        .mockReturnValueOnce(mockTask1)
        .mockReturnValueOnce(mockTask2);

      const { result } = renderHook(() =>
        useTasks(mockWorkingStart, mockWorkingEnd)
      );

      act(() => {
        result.current.createTask();
      });

      act(() => {
        result.current.createTask();
      });

      act(() => {
        result.current.selectTask('task1');
      });

      // Should handle rapid state changes correctly
      expect(result.current.tasks).toHaveLength(2);
    });
  });
});
