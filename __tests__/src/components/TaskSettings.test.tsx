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

      // Should render task name input with correct value
      const nameInput = screen.getByRole('textbox');
      expect(nameInput).toBeDefined();
      expect((nameInput as HTMLInputElement).value).toBe('Test Task');

      // Should render duration select with correct numerical value
      const durationSelect = screen.getByRole('combobox');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('2'); // 2 = 30 minutes

      // Should render delete button
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeDefined();
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

      const nameInput = screen.getByRole('textbox');
      expect((nameInput as HTMLInputElement).value).toBe('Scheduled Task');

      const durationSelect = screen.getByRole('combobox');
      expect((durationSelect as HTMLSelectElement).value).toBe('4'); // 4 = 60 minutes
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

      const durationSelect = screen.getByRole('combobox');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('2'); // Current task duration is 2 (30 minutes)
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

      // Check that all numerical duration options are present
      const durationSelect = screen.getByRole('combobox');
      const options = Array.from(durationSelect.querySelectorAll('option'));

      expect(options).toHaveLength(4);
      expect(options[0].value).toBe('1'); // 15 minutes
      expect(options[1].value).toBe('2'); // 30 minutes
      expect(options[2].value).toBe('3'); // 45 minutes
      expect(options[3].value).toBe('4'); // 1 hour
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

      const durationSelect = screen.getByRole('combobox');
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

      const durationSelect = screen.getByRole('combobox');

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

      const nameInput = screen.getByRole('textbox');
      const nameLabel =
        nameInput.labels?.[0] || screen.getByLabelText(/task name/i);

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

      const durationSelect = screen.getByRole('combobox');
      const durationLabel =
        durationSelect.labels?.[0] || screen.getByLabelText(/task duration/i);

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

  describe('Numerical Duration Validation', () => {
    it('should correctly handle duration value to time conversion', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      // Test all duration values and their numeric representations
      const durationTests = [
        { duration: 1, expectedValue: '1' }, // 15 minutes
        { duration: 2, expectedValue: '2' }, // 30 minutes
        { duration: 3, expectedValue: '3' }, // 45 minutes
        { duration: 4, expectedValue: '4' }, // 1 hour
      ];

      durationTests.forEach(({ duration, expectedValue }) => {
        const testTask = { ...mockTask, duration };

        const { unmount } = render(
          <TaskSettings
            task={testTask}
            onUpdateTask={mockOnUpdateTask}
            onDeleteTask={mockOnDeleteTask}
          />
        );

        const durationSelect = screen.getByRole('combobox');
        expect((durationSelect as HTMLSelectElement).value).toBe(expectedValue);

        unmount();
      });
    });

    it('should validate duration boundaries', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByRole('combobox');
      const options = Array.from(durationSelect.querySelectorAll('option'));

      // Verify we have exactly 4 options
      expect(options).toHaveLength(4);

      // Verify numeric values are sequential from 1 to 4
      const values = options.map((option) => parseInt(option.value));
      expect(values).toEqual([1, 2, 3, 4]);

      // Verify no values outside the valid range
      expect(values.every((val) => val >= 1 && val <= 4)).toBe(true);
    });

    it('should handle duration changes with proper numeric conversion', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByRole('combobox');

      // Change to duration 1 and verify numeric conversion
      fireEvent.change(durationSelect, { target: { value: '1' } });
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 1, // Should be a number, not string
      });

      // Change to duration 4 and verify numeric conversion
      fireEvent.change(durationSelect, { target: { value: '4' } });
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 4, // Should be a number, not string
      });
    });

    it('should maintain duration value type consistency', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSelect = screen.getByRole('combobox');

      ['1', '2', '3', '4'].forEach((value) => {
        fireEvent.change(durationSelect, { target: { value } });
        const lastCall =
          mockOnUpdateTask.mock.calls[mockOnUpdateTask.mock.calls.length - 1];

        // Verify duration is always passed as a number
        expect(typeof lastCall[0].duration).toBe('number');
        expect(lastCall[0].duration).toBe(parseInt(value));
      });
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

      const nameInput = screen.getByRole('textbox');
      expect((nameInput as HTMLInputElement).value).toBe('');
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

      const durationSelect = screen.getByRole('combobox');
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

      const durationSelect = screen.getByRole('combobox');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('1'); // Minimum duration value
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

      const durationSelect = screen.getByRole('combobox');
      expect(durationSelect).toBeDefined();
      expect((durationSelect as HTMLSelectElement).value).toBe('4'); // Maximum duration value
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
