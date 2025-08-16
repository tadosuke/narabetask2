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

      // Should render duration slider with correct numerical value
      const durationSlider = screen.getByRole('slider');
      expect(durationSlider).toBeDefined();
      expect((durationSlider as HTMLInputElement).value).toBe('2'); // 2 = 30 minutes

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

      const durationSlider = screen.getByRole('slider');
      expect((durationSlider as HTMLInputElement).value).toBe('4'); // 4 = 60 minutes
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

  describe('Duration Slider', () => {
    it('should display current task duration in slider field', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSlider = screen.getByRole('slider');
      expect(durationSlider).toBeDefined();
      expect((durationSlider as HTMLInputElement).value).toBe('2'); // Current task duration is 2 (30 minutes)
    });

    it('should have correct slider attributes', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSlider = screen.getByRole('slider');
      expect(durationSlider.getAttribute('min')).toBe('1');
      expect(durationSlider.getAttribute('max')).toBe('16');
      expect(durationSlider.getAttribute('step')).toBe('1');
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

      const durationSlider = screen.getByRole('slider');
      fireEvent.change(durationSlider, { target: { value: '4' } });

      expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 4,
      });
    });

    it('should handle various duration values correctly', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSlider = screen.getByRole('slider');

      // Test various duration values
      const durationValues = [
        { value: '1', expected: 1 },
        { value: '8', expected: 8 },
        { value: '16', expected: 16 },
      ];

      durationValues.forEach(({ value, expected }) => {
        fireEvent.change(durationSlider, { target: { value } });
        expect(mockOnUpdateTask).toHaveBeenCalledWith({
          ...mockTask,
          duration: expected,
        });
      });

      expect(mockOnUpdateTask).toHaveBeenCalledTimes(3);
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

    it('should have proper htmlFor and id attributes for duration slider', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();

      render(
        <TaskSettings
          task={mockTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSlider = screen.getByRole('slider');
      const durationLabel =
        durationSlider.labels?.[0] || screen.getByLabelText(/task duration/i);

      expect(durationLabel.getAttribute('for')).toBe('task-duration');
      expect(durationSlider.getAttribute('id')).toBe('task-duration');
      expect(durationSlider.getAttribute('aria-label')).toBe(
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

      // Test various duration values and their numeric representations
      const durationTests = [
        { duration: 1, expectedValue: '1' }, // 15 minutes
        { duration: 2, expectedValue: '2' }, // 30 minutes
        { duration: 8, expectedValue: '8' }, // 2 hours
        { duration: 16, expectedValue: '16' }, // 4 hours
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

        const durationSlider = screen.getByRole('slider');
        expect((durationSlider as HTMLInputElement).value).toBe(expectedValue);

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

      const durationSlider = screen.getByRole('slider');
      
      // Verify slider attributes
      expect(durationSlider.getAttribute('min')).toBe('1');
      expect(durationSlider.getAttribute('max')).toBe('16');
      expect(durationSlider.getAttribute('step')).toBe('1');
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

      const durationSlider = screen.getByRole('slider');

      // Change to duration 1 and verify numeric conversion
      fireEvent.change(durationSlider, { target: { value: '1' } });
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 1, // Should be a number, not string
      });

      // Change to duration 16 and verify numeric conversion
      fireEvent.change(durationSlider, { target: { value: '16' } });
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        ...mockTask,
        duration: 16, // Should be a number, not string
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

      const durationSlider = screen.getByRole('slider');

      ['1', '8', '16'].forEach((value) => {
        fireEvent.change(durationSlider, { target: { value } });
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

      const durationSlider = screen.getByRole('slider');
      fireEvent.change(durationSlider, { target: { value: '2' } });

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

      const durationSlider = screen.getByRole('slider');
      expect(durationSlider).toBeDefined();
      expect((durationSlider as HTMLInputElement).value).toBe('1'); // Minimum duration value
    });

    it('should handle maximum duration value (16)', () => {
      const mockOnUpdateTask = vi.fn();
      const mockOnDeleteTask = vi.fn();
      const maxDurationTask = { ...mockTask, duration: 16 };

      render(
        <TaskSettings
          task={maxDurationTask}
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const durationSlider = screen.getByRole('slider');
      expect(durationSlider).toBeDefined();
      expect((durationSlider as HTMLInputElement).value).toBe('16'); // Maximum duration value
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
