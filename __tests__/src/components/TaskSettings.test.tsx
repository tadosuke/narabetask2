import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskSettings } from '../../../src/components/TaskSettings';
import type { Task } from '../../../src/types';

// Mock task data for testing
const mockTask: Task = {
  id: 'task-1',
  name: 'Test Task',
  duration: 2, // 30 minutes (15 minutes × 2)
  position: null,
};

const mockTaskWithPosition: Task = {
  id: 'task-2',
  name: 'Scheduled Task',
  duration: 4, // 60 minutes (15 minutes × 4)
  position: {
    row: 0,
    startTime: '09:00',
  },
};

describe('TaskSettings Component', () => {
  describe('Basic Rendering', () => {
    it('should return null when no task is provided', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      const { container } = render(
        <TaskSettings
          task={null}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Component should render nothing when task is null
      expect(container.firstChild).toBeNull();
    });

    it('should render task settings UI when a task is provided', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Should render the main heading
      expect(screen.getByText('Task Settings')).toBeDefined();

      // Should render task name label and input
      expect(screen.getByText('Task Name:')).toBeDefined();
      expect(screen.getByDisplayValue('Test Task')).toBeDefined();

      // Should render duration label and select
      expect(screen.getByText('Estimated Time:')).toBeDefined();
      expect(screen.getByDisplayValue('30 minutes')).toBeDefined();

      // Should render delete button
      expect(screen.getByLabelText('Delete task')).toBeDefined();
    });

    it('should render correctly with task that has position', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTaskWithPosition}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByDisplayValue('Scheduled Task')).toBeDefined();
      expect(screen.getByDisplayValue('1 hour')).toBeDefined();
    });
  });

  describe('Task Name Input', () => {
    it('should display current task name in input field', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Task');
      expect(nameInput).toBeDefined();
      expect((nameInput as HTMLInputElement).value).toBe('Test Task');
    });

    it('should call onUpdateTask when task name is changed', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Task');
      fireEvent.change(nameInput, { target: { value: 'Updated Task Name' } });

      expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        name: 'Updated Task Name',
      });
    });

    it('should handle empty task name input', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Task');
      fireEvent.change(nameInput, { target: { value: '' } });

      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        name: '',
      });
    });

    it('should handle special characters in task name', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Task');
      const specialCharName = 'Task with @#$%^&*() characters!';
      fireEvent.change(nameInput, { target: { value: specialCharName } });

      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        name: specialCharName,
      });
    });
  });

  describe('Duration Select Dropdown', () => {
    it('should display current task duration in select field', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByDisplayValue('30 minutes');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('2');
    });

    it('should display all available duration options', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Check that all duration options are present
      expect(screen.getByText('15 minutes')).toBeDefined();
      expect(screen.getByText('30 minutes')).toBeDefined();
      expect(screen.getByText('45 minutes')).toBeDefined();
      expect(screen.getByText('1 hour')).toBeDefined();
    });

    it('should call onUpdateTask when duration is changed', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByDisplayValue('30 minutes');
      fireEvent.change(durationSelect, { target: { value: '4' } });

      expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 4,
      });
    });

    it('should handle all duration option changes correctly', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByDisplayValue('30 minutes');

      // Test each duration option
      const durationOptions = [
        { value: '1', expected: 1 },
        { value: '2', expected: 2 },
        { value: '3', expected: 3 },
        { value: '4', expected: 4 },
      ];

      durationOptions.forEach(({ value, expected }) => {
        fireEvent.change(durationSelect, { target: { value } });
        expect(mockOnUpdateTask).toHaveBeenCalledWith({
          ...mockTask,
          duration: expected,
        });
      });

      expect(mockOnUpdateTask).toHaveBeenCalledTimes(4);
    });
  });

  describe('Delete Button', () => {
    it('should render delete button with correct accessibility attributes', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const deleteButton = screen.getByLabelText('Delete task');
      expect(deleteButton).toBeDefined();
      expect(deleteButton.textContent).toBe('delete');
    });

    it('should call onDeleteTask with correct task ID when clicked', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const deleteButton = screen.getByLabelText('Delete task');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteTask).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteTask).toHaveBeenCalledWith('task-1');
    });

    it('should call onDeleteTask with correct ID for different tasks', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTaskWithPosition}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const deleteButton = screen.getByLabelText('Delete task');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteTask).toHaveBeenCalledWith('task-2');
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have proper htmlFor and id attributes for task name input', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameLabel = screen.getByText('Task Name:');
      const nameInput = screen.getByDisplayValue('Test Task');

      expect(nameLabel.getAttribute('for')).toBe('task-name');
      expect(nameInput.getAttribute('id')).toBe('task-name');
      expect(nameInput.getAttribute('aria-label')).toBe('Edit task name');
    });

    it('should have proper htmlFor and id attributes for duration select', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationLabel = screen.getByText('Estimated Time:');
      const durationSelect = screen.getByDisplayValue('30 minutes');

      expect(durationLabel.getAttribute('for')).toBe('task-duration');
      expect(durationSelect.getAttribute('id')).toBe('task-duration');
      expect(durationSelect.getAttribute('aria-label')).toBe(
        'Select task duration'
      );
    });

    it('should have proper aria-label for delete button', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const deleteButton = screen.getByLabelText('Delete task');
      expect(deleteButton.getAttribute('aria-label')).toBe('Delete task');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle task with empty name gracefully', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();
      const emptyNameTask = { ...mockTask, name: '' };

      expect(() => {
        render(
          <TaskSettings
            task={emptyNameTask}
            onUpdateTask={mockOnUpdateTask}
            onDeleteTask={mockOnDeleteTask}
          />
        );
      }).not.toThrow();

      const nameInput = screen.getByDisplayValue('');
      expect(nameInput).toBeDefined();
    });

    it('should handle task with very long name', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();
      const longNameTask = {
        ...mockTask,
        name: 'This is a very long task name that exceeds normal length expectations and should still be handled properly by the component',
      };

      render(
        <TaskSettings
          task={longNameTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByDisplayValue(longNameTask.name)).toBeDefined();
    });

    it('should preserve task position when updating name or duration', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTaskWithPosition}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const nameInput = screen.getByDisplayValue('Scheduled Task');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTaskWithPosition,
        name: 'Updated Name',
      });

      // Reset mock
      mockOnUpdateTask.mockClear();

      const durationSelect = screen.getByDisplayValue('1 hour');
      fireEvent.change(durationSelect, { target: { value: '2' } });

      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTaskWithPosition,
        duration: 2,
      });
    });

    it('should handle minimum duration value (1)', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();
      const minDurationTask = { ...mockTask, duration: 1 };

      render(
        <TaskSettings
          task={minDurationTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByDisplayValue('15 minutes');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('1');
    });

    it('should handle maximum duration value (4)', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();
      const maxDurationTask = { ...mockTask, duration: 4 };

      render(
        <TaskSettings
          task={maxDurationTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByDisplayValue('1 hour');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('4');
    });
  });

  describe('Component Props Validation', () => {
    it('should not call any callbacks when rendered without user interaction', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // No callbacks should be called just from rendering
      expect(mockOnUpdateTask).not.toHaveBeenCalled();
      expect(mockOnDeleteTask).not.toHaveBeenCalled();
    });

    it('should maintain callback references between renders', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      const { rerender } = render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Rerender with same props
      rerender(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const deleteButton = screen.getByLabelText('Delete task');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteTask).toHaveBeenCalledTimes(1);
    });
  });
});
