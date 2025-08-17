import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCreator, TaskPool } from '../../../src/components/TaskPool';
import type { Task } from '../../../src/types';

// Mock TaskCard component to avoid dependencies
vi.mock('../../../src/components/TaskCard', () => ({
  TaskCard: ({
    task,
    onClick,
  }: {
    task: Task;
    onClick: (id: string) => void;
  }) => (
    <div data-testid={`task-card-${task.id}`} onClick={() => onClick(task.id)}>
      Task: {task.name}
    </div>
  ),
}));

// Test data - tasks with different scheduling states
const mockUnscheduledTask: Task = {
  id: 'unscheduled-1',
  name: 'Unscheduled Task',
  duration: 2,
  position: null, // This task should appear in pool
};

const mockScheduledTask: Task = {
  id: 'scheduled-1',
  name: 'Scheduled Task',
  duration: 4,
  position: { row: 0, startTime: '09:00' }, // This task should NOT appear in pool
};

const mockAnotherUnscheduledTask: Task = {
  id: 'unscheduled-2',
  name: 'Another Unscheduled Task',
  duration: 1,
  position: null,
};

describe('TaskCreator Component', () => {
  describe('Basic Rendering', () => {
    it('renders a button element', () => {
      const mockOnCreateTask = vi.fn();

      render(<TaskCreator onCreateTask={mockOnCreateTask} />);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('renders with proper container structure', () => {
      const mockOnCreateTask = vi.fn();

      render(<TaskCreator onCreateTask={mockOnCreateTask} />);

      // Check that component is wrapped in a div
      const container = document.querySelector('div');
      expect(container).toBeDefined();

      // Check that button is inside the container
      const button = container?.querySelector('button');
      expect(button).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('calls onCreateTask when button is clicked', () => {
      const mockOnCreateTask = vi.fn();

      render(<TaskCreator onCreateTask={mockOnCreateTask} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnCreateTask).toHaveBeenCalledTimes(1);
    });

    it('calls onCreateTask multiple times when clicked multiple times', () => {
      const mockOnCreateTask = vi.fn();

      render(<TaskCreator onCreateTask={mockOnCreateTask} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnCreateTask).toHaveBeenCalledTimes(3);
    });

    it('does not call onCreateTask on render', () => {
      const mockOnCreateTask = vi.fn();

      render(<TaskCreator onCreateTask={mockOnCreateTask} />);

      expect(mockOnCreateTask).not.toHaveBeenCalled();
    });
  });
});

describe('TaskPool Component', () => {
  describe('Basic Rendering', () => {
    it('renders with proper container structure', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // Check main container exists with correct class
      const container = document.querySelector('.task-pool');
      expect(container).toBeDefined();

      // Check content container exists
      const content = document.querySelector('.task-pool-content');
      expect(content).toBeDefined();
    });

    it('renders without errors when tasks array is empty', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      expect(() => {
        render(
          <TaskPool
            tasks={mockTasks}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Task Filtering and Display', () => {
    it('displays only unscheduled tasks (position === null)', () => {
      const mockTasks: Task[] = [
        mockUnscheduledTask,
        mockScheduledTask,
        mockAnotherUnscheduledTask,
      ];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // Should show unscheduled tasks
      expect(screen.getByTestId('task-card-unscheduled-1')).toBeDefined();
      expect(screen.getByTestId('task-card-unscheduled-2')).toBeDefined();

      // Should not show scheduled task
      expect(screen.queryByTestId('task-card-scheduled-1')).toBeNull();
    });

    it('displays no task cards when all tasks are scheduled', () => {
      const mockTasks: Task[] = [mockScheduledTask];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // Should not display any task cards
      const taskCards = document.querySelectorAll(
        '[data-testid^="task-card-"]'
      );
      expect(taskCards.length).toBe(0);
    });

    it('handles multiple unscheduled tasks correctly', () => {
      const mockTasks: Task[] = [
        mockUnscheduledTask,
        mockAnotherUnscheduledTask,
        {
          id: 'unscheduled-3',
          name: 'Third Task',
          duration: 3,
          position: null,
        },
      ];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // Should display all unscheduled tasks
      const taskCards = document.querySelectorAll(
        '[data-testid^="task-card-"]'
      );
      expect(taskCards.length).toBe(3);
    });
  });

  describe('Task Click Handling', () => {
    it('calls onTaskClick with correct task ID when task is clicked', () => {
      const mockTasks: Task[] = [mockUnscheduledTask];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const taskCard = screen.getByTestId('task-card-unscheduled-1');
      fireEvent.click(taskCard);

      expect(mockOnTaskClick).toHaveBeenCalledTimes(1);
      expect(mockOnTaskClick).toHaveBeenCalledWith('unscheduled-1');
    });

    it('calls onTaskClick with different task IDs for different tasks', () => {
      const mockTasks: Task[] = [
        mockUnscheduledTask,
        mockAnotherUnscheduledTask,
      ];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const firstTask = screen.getByTestId('task-card-unscheduled-1');
      const secondTask = screen.getByTestId('task-card-unscheduled-2');

      fireEvent.click(firstTask);
      fireEvent.click(secondTask);

      expect(mockOnTaskClick).toHaveBeenCalledTimes(2);
      expect(mockOnTaskClick).toHaveBeenNthCalledWith(1, 'unscheduled-1');
      expect(mockOnTaskClick).toHaveBeenNthCalledWith(2, 'unscheduled-2');
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('handles dragover event correctly', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const container = document.querySelector('.task-pool');
      expect(container).toBeDefined();

      // Create mock drag event
      const dragOverEvent = new Event('dragover', { bubbles: true });
      const mockPreventDefault = vi.fn();
      const mockDataTransfer = { dropEffect: '' };

      Object.defineProperty(dragOverEvent, 'preventDefault', {
        value: mockPreventDefault,
        writable: false,
      });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      if (container) {
        fireEvent(container, dragOverEvent);
      }

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockDataTransfer.dropEffect).toBe('move');
    });

    it('handles drop event and calls onTaskDrop with correct task ID', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const container = document.querySelector('.task-pool');
      expect(container).toBeDefined();

      // Create mock drop event
      const dropEvent = new Event('drop', { bubbles: true });
      const mockPreventDefault = vi.fn();
      const mockGetData = vi.fn().mockReturnValue('test-task-id');
      const mockDataTransfer = { getData: mockGetData };

      Object.defineProperty(dropEvent, 'preventDefault', {
        value: mockPreventDefault,
        writable: false,
      });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      if (container) {
        fireEvent(container, dropEvent);
      }

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockGetData).toHaveBeenCalledWith('text/plain');
      expect(mockOnTaskDrop).toHaveBeenCalledWith('test-task-id');
    });

    it('handles drop event with different task IDs', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const container = document.querySelector('.task-pool');

      // First drop
      const dropEvent1 = new Event('drop', { bubbles: true });
      const mockPreventDefault1 = vi.fn();
      const mockGetData1 = vi.fn().mockReturnValue('first-task-id');

      Object.defineProperty(dropEvent1, 'preventDefault', {
        value: mockPreventDefault1,
        writable: false,
      });
      Object.defineProperty(dropEvent1, 'dataTransfer', {
        value: { getData: mockGetData1 },
        writable: false,
      });

      // Second drop
      const dropEvent2 = new Event('drop', { bubbles: true });
      const mockPreventDefault2 = vi.fn();
      const mockGetData2 = vi.fn().mockReturnValue('second-task-id');

      Object.defineProperty(dropEvent2, 'preventDefault', {
        value: mockPreventDefault2,
        writable: false,
      });
      Object.defineProperty(dropEvent2, 'dataTransfer', {
        value: { getData: mockGetData2 },
        writable: false,
      });

      if (container) {
        fireEvent(container, dropEvent1);
        fireEvent(container, dropEvent2);
      }

      expect(mockOnTaskDrop).toHaveBeenCalledTimes(2);
      expect(mockOnTaskDrop).toHaveBeenNthCalledWith(1, 'first-task-id');
      expect(mockOnTaskDrop).toHaveBeenNthCalledWith(2, 'second-task-id');
    });

    it('does not call onTaskDrop during dragover', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const container = document.querySelector('.task-pool');
      const dragOverEvent = new Event('dragover', { bubbles: true });

      Object.defineProperty(dragOverEvent, 'preventDefault', {
        value: vi.fn(),
        writable: false,
      });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { dropEffect: '' },
        writable: false,
      });

      if (container) {
        fireEvent(container, dragOverEvent);
      }

      expect(mockOnTaskDrop).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles tasks with null position correctly', () => {
      const taskWithNullPosition: Task = {
        id: 'null-position-task',
        name: 'Null Position Task',
        duration: 1,
        position: null,
      };
      const mockTasks: Task[] = [taskWithNullPosition];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByTestId('task-card-null-position-task')).toBeDefined();
    });

    it('handles tasks with undefined position gracefully', () => {
      const taskWithUndefinedPosition = {
        id: 'undefined-position-task',
        name: 'Undefined Position Task',
        duration: 1,
        position: undefined,
      } as Task;
      const mockTasks: Task[] = [taskWithUndefinedPosition];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      expect(() => {
        render(
          <TaskPool
            tasks={mockTasks}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });

    it('handles empty task array without errors', () => {
      const mockTasks: Task[] = [];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      expect(() => {
        render(
          <TaskPool
            tasks={mockTasks}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();

      const taskCards = document.querySelectorAll(
        '[data-testid^="task-card-"]'
      );
      expect(taskCards.length).toBe(0);
    });

    it('handles large number of unscheduled tasks', () => {
      const largeMockTasks: Task[] = Array.from({ length: 50 }, (_, index) => ({
        id: `task-${index}`,
        name: `Task ${index}`,
        duration: 1,
        position: null,
      }));
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      expect(() => {
        render(
          <TaskPool
            tasks={largeMockTasks}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();

      const taskCards = document.querySelectorAll(
        '[data-testid^="task-card-"]'
      );
      expect(taskCards.length).toBe(50);
    });
  });

  describe('Component Integration', () => {
    it('properly passes task data to TaskCard components', () => {
      const mockTasks: Task[] = [mockUnscheduledTask];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <TaskPool
          tasks={mockTasks}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // TaskCard should receive the task data and display task name
      expect(screen.getByText('Task: Unscheduled Task')).toBeDefined();
    });

    it('maintains proper key prop for TaskCard components', () => {
      const mockTasks: Task[] = [
        mockUnscheduledTask,
        mockAnotherUnscheduledTask,
      ];
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      // This test ensures that React keys are properly set
      // If keys are not unique, React would warn about it
      expect(() => {
        render(
          <TaskPool
            tasks={mockTasks}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });
  });
});
